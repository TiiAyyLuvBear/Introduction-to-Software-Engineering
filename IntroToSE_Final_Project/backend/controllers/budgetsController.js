import mongoose from 'mongoose'
import Budget from '../models/Budget.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import { computeOverspend, parseOverspendQuery } from '../utils/budgetOverspend.js'

function canViewWallet(wallet, userId) {
  if (!wallet || !userId) return false
  const uid = userId.toString()
  if (wallet.userId?.toString() === uid) return true
  if (wallet.ownerId?.toString() === uid) return true
  if (Array.isArray(wallet.members) && wallet.members.some((m) => m.userId?.toString() === uid)) return true
  return false
}

function canEditWallet(wallet, userId) {
  if (!canViewWallet(wallet, userId)) return false
  const uid = userId.toString()
  if (!wallet.isShared) return wallet.userId?.toString() === uid || wallet.ownerId?.toString() === uid
  if (wallet.ownerId?.toString() === uid) return true
  const member = wallet.members?.find((m) => m.userId?.toString() === uid)
  return member?.permission === 'edit'
}

function toDateMaybe(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

async function computeBudgetSpent({ walletId, categoryId, startDate, endDate }) {
  const now = new Date()
  const start = startDate || now
  const end = endDate ? new Date(Math.min(endDate.getTime(), now.getTime())) : now

  const match = {
    // Transaction schema stores walletId/categoryId as String
    walletId: String(walletId),
    type: 'expense',
    date: { $gte: start, $lte: end },
  }
  if (categoryId) match.categoryId = String(categoryId)

  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  return rows[0]?.total || 0
}

function withComputedSpent(budgetDoc, spent) {
  const info = budgetDoc.getDisplayInfo()
  const pct = info.amount > 0 ? Math.round((spent / info.amount) * 100) : 0
  return {
    ...info,
    spent,
    remaining: Math.max(0, info.amount - spent),
    percentage: pct,
    isOverBudget: spent > info.amount,
    isOverThreshold: pct >= Number(budgetDoc.alertThreshold || 0),
  }
}

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { status = 'active', period, walletId } = req.query
    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }

    const walletFilter = {
      status: 'active',
      $or: [{ userId }, { ownerId: userId }, { 'members.userId': userId }],
    }
    if (walletId) walletFilter._id = walletId

    const wallets = await Wallet.find(walletFilter).select('_id')
    const walletIds = wallets.map((w) => w._id)

    const query = { status, walletId: { $in: walletIds } }
    if (period) query.period = period

    const budgets = await Budget.find(query)
      .populate('categoryId', 'name type color')
      .populate('walletId', 'name type currency ownerId userId isShared members status')
      .sort({ createdAt: -1 })

    const spentList = await Promise.all(
      budgets.map((b) =>
        computeBudgetSpent({
          walletId: b.walletId?._id || b.walletId,
          categoryId: b.categoryId?._id || b.categoryId,
          startDate: b.startDate,
          endDate: b.endDate,
        })
      )
    )

    res.json({
      success: true,
      data: budgets.map((b, i) => withComputedSpent(b, spentList[i])),
    })
  } catch (err) {
    console.error('Get budgets error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// M3-03: Check overspend for a wallet/category
// GET /api/budgets/overspend?walletId=...&categoryId=...&date=...
export const getOverspend = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const { walletId, categoryId, atDate } = parseOverspendQuery(req.query)

    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ success: false, error: 'Invalid walletId' })
    }
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, error: 'Invalid categoryId' })
    }

    const result = await computeOverspend({ userId, walletId, categoryId, atDate })
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Overspend error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

export const getBudget = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' })
    }

    const budget = await Budget.findById(id)
      .populate('categoryId', 'name type color')
      .populate('walletId', 'name type currency ownerId userId isShared members status')
    if (!budget) return res.status(404).json({ error: 'Not found' })

    if (!budget.walletId || !canViewWallet(budget.walletId, userId)) {
      return res.status(403).json({ error: 'You do not have permission to view this budget' })
    }

    const spent = await computeBudgetSpent({
      walletId: budget.walletId?._id || budget.walletId,
      categoryId: budget.categoryId?._id || budget.categoryId,
      startDate: budget.startDate,
      endDate: budget.endDate,
    })

    res.json({ success: true, data: withComputedSpent(budget, spent) })
  } catch (err) {
    console.error('Get budget error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

export const createBudget = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const {
      walletId,
      categoryId,
      name,
      amount,
      period = 'monthly',
      startDate,
      endDate,
      alertThreshold,
      enableAlerts,
    } = req.body

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Budget amount must be greater than 0' })
    }
    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'walletId is required' })
    }
    if (!startDate) return res.status(400).json({ error: 'startDate is required' })
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' })
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period' })
    }

    const start = toDateMaybe(startDate)
    const end = toDateMaybe(endDate)
    if (!start) return res.status(400).json({ error: 'Invalid startDate' })
    if (endDate && !end) return res.status(400).json({ error: 'Invalid endDate' })
    if (end && end < start) return res.status(400).json({ error: 'endDate must be after startDate' })

    const wallet = await Wallet.findOne({ _id: walletId, status: 'active' })
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' })
    if (!canEditWallet(wallet, userId)) {
      return res.status(403).json({ error: 'You do not have permission to create budgets for this wallet' })
    }

    const created = await Budget.createBudget({
      userId,
      walletId,
      categoryId: categoryId || undefined,
      name,
      amount,
      period,
      startDate: start,
      endDate: end || undefined,
      alertThreshold,
      enableAlerts,
    })

    res.status(201).json({ success: true, data: created })
  } catch (err) {
    console.error('Create budget error:', err)
    res.status(400).json({ success: false, error: err.message || 'Failed to create budget' })
  }
}

export const updateBudget = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' })
    }

    const updates = {}
    const allowed = [
      'name',
      'amount',
      'period',
      'startDate',
      'endDate',
      'alertThreshold',
      'enableAlerts',
      'status',
      'categoryId',
      'walletId',
    ]
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    if (updates.amount !== undefined && (typeof updates.amount !== 'number' || updates.amount <= 0)) {
      return res.status(400).json({ error: 'Budget amount must be greater than 0' })
    }
    if (updates.categoryId && !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' })
    }
    if (updates.walletId && !mongoose.Types.ObjectId.isValid(updates.walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }
    if (updates.categoryId === null || updates.categoryId === '') updates.categoryId = undefined

    if (updates.period !== undefined && !['daily', 'weekly', 'monthly', 'yearly'].includes(updates.period)) {
      return res.status(400).json({ error: 'Invalid period' })
    }

    if (updates.startDate !== undefined) {
      const d = toDateMaybe(updates.startDate)
      if (!d) return res.status(400).json({ error: 'Invalid startDate' })
      updates.startDate = d
    }
    if (updates.endDate !== undefined && updates.endDate !== null && updates.endDate !== '') {
      const d = toDateMaybe(updates.endDate)
      if (!d) return res.status(400).json({ error: 'Invalid endDate' })
      updates.endDate = d
    }
    if (updates.endDate === null || updates.endDate === '') updates.endDate = undefined

    const existing = await Budget.findById(id).populate('walletId', 'ownerId userId isShared members status')
    if (!existing) return res.status(404).json({ error: 'Not found' })

    const wallet = updates.walletId
      ? await Wallet.findOne({ _id: updates.walletId, status: 'active' })
      : existing.walletId

    if (!wallet || !canEditWallet(wallet, userId)) {
      return res.status(403).json({ error: 'You do not have permission to update this budget' })
    }

    const finalStart = updates.startDate || existing.startDate
    const finalEnd = updates.endDate !== undefined ? updates.endDate : existing.endDate
    if (finalEnd && finalStart && finalEnd < finalStart) {
      return res.status(400).json({ error: 'endDate must be after startDate' })
    }

    const budget = await Budget.findOneAndUpdate({ _id: id }, updates, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name type color')

    if (!budget) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true, data: budget.getDisplayInfo() })
  } catch (err) {
    console.error('Update budget error:', err)
    res.status(400).json({ success: false, error: err.message || 'Failed to update budget' })
  }
}

export const deleteBudget = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' })
    }

    const budget = await Budget.findById(id).populate('walletId', 'ownerId userId isShared members status')
    if (!budget) return res.status(404).json({ error: 'Not found' })

    if (!budget.walletId || !canEditWallet(budget.walletId, userId)) {
      return res.status(403).json({ error: 'You do not have permission to delete this budget' })
    }

    const removed = await Budget.findOneAndDelete({ _id: id })
    if (!removed) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('Delete budget error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
