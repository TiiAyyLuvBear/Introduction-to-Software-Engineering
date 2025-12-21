import mongoose from 'mongoose'
import Budget from '../models/Budget.js'
import { computeOverspend, parseOverspendQuery } from '../utils/budgetOverspend.js'

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { status = 'active', period, walletId } = req.query
    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }

    const budgets = await Budget.getUserBudgets(userId, { status, period, walletId })
    res.json({ success: true, data: budgets })
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

    const budget = await Budget.findOne({ _id: id, userId }).populate('categoryId', 'name type color')
    if (!budget) return res.status(404).json({ error: 'Not found' })

    res.json({ success: true, data: budget.getDisplayInfo() })
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

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }
    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'walletId is required' })
    }
    if (!startDate) return res.status(400).json({ error: 'startDate is required' })
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' })
    }

    const created = await Budget.createBudget({
      userId,
      walletId,
      categoryId: categoryId || undefined,
      name,
      amount,
      period,
      startDate,
      endDate,
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
    if (updates.amount !== undefined && (typeof updates.amount !== 'number' || updates.amount < 0)) {
      return res.status(400).json({ error: 'Invalid amount' })
    }
    if (updates.categoryId && !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' })
    }
    if (updates.walletId && !mongoose.Types.ObjectId.isValid(updates.walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }
    if (updates.categoryId === null || updates.categoryId === '') updates.categoryId = undefined

    const budget = await Budget.findOneAndUpdate({ _id: id, userId }, updates, {
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

    const removed = await Budget.findOneAndDelete({ _id: id, userId })
    if (!removed) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('Delete budget error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
