import mongoose from 'mongoose'
import SavingGoal from '../models/SavingGoal.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import { withMongoSession } from '../utils/mongoSession.js'

function getWalletPermission(wallet, userId) {
  if (!wallet || !userId) return null
  const uid = userId.toString()
  if (wallet.userId?.toString() === uid) return 'owner'
  if (wallet.ownerId?.toString() === uid) return 'owner'

  const member = Array.isArray(wallet.members)
    ? wallet.members.find((m) => m.userId?.toString() === uid)
    : null

  return member?.permission || null
}

function canViewWallet(wallet, userId) {
  return Boolean(getWalletPermission(wallet, userId))
}

function canEditWallet(wallet, userId) {
  const p = getWalletPermission(wallet, userId)
  return p === 'owner' || p === 'edit'
}

async function getAccessibleWalletIds(userId) {
  const wallets = await Wallet.find({
    status: 'active',
    $or: [{ userId }, { ownerId: userId }, { 'members.userId': userId }],
  }).select('_id')

  return wallets.map((w) => w._id)
}

export const getGoals = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { status, priority, walletId } = req.query
    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) return res.status(400).json({ error: 'Invalid walletId' })

    const walletIds = await getAccessibleWalletIds(userId)
    const query = {
      walletId: walletId ? new mongoose.Types.ObjectId(walletId) : { $in: walletIds },
    }
    if (status) query.status = status
    if (priority) query.priority = priority

    if (walletId) {
      const allowed = walletIds.some((id) => id.toString() === walletId)
      if (!allowed) return res.status(404).json({ error: 'Wallet not found' })
    }

    const goals = await SavingGoal.find(query)
      .populate('walletId', 'name type currency currentBalance isShared ownerId userId members status')
      .sort({ priority: -1, createdAt: -1 })

    res.json({ success: true, data: goals.map((g) => g.getDisplayInfo()) })
  } catch (err) {
    console.error('Get goals error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

export const getGoal = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    const goal = await SavingGoal.findById(id).populate('walletId', 'name type currency currentBalance isShared ownerId userId members status')
    if (!goal) return res.status(404).json({ error: 'Not found' })

    const wallet = goal.walletId
    if (!wallet || !canViewWallet(wallet, userId) || wallet.status !== 'active') {
      return res.status(404).json({ error: 'Not found' })
    }

    res.json({ success: true, data: goal.getDisplayInfo() })
  } catch (err) {
    console.error('Get goal error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

export const createGoal = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { name, targetAmount, currentAmount, deadline, description, image, walletId, priority } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' })
    if (typeof targetAmount !== 'number' || targetAmount <= 0) return res.status(400).json({ error: 'Invalid targetAmount' })
    if (currentAmount !== undefined && (typeof currentAmount !== 'number' || currentAmount < 0)) {
      return res.status(400).json({ error: 'Invalid currentAmount' })
    }
    if (!walletId) return res.status(400).json({ error: 'walletId is required' })
    if (!mongoose.Types.ObjectId.isValid(walletId)) return res.status(400).json({ error: 'Invalid walletId' })

    const wallet = await Wallet.findById(walletId)
    if (!wallet || !canViewWallet(wallet, userId) || wallet.status !== 'active') {
      return res.status(404).json({ error: 'Wallet not found' })
    }
    if (wallet.isShared && !canEditWallet(wallet, userId)) {
      return res.status(403).json({ error: 'Insufficient permission' })
    }

    const dup = await SavingGoal.findOne({ walletId: wallet._id, name: name.trim() })
    if (dup) return res.status(409).json({ error: 'Goal name already exists in this wallet' })

    const created = await SavingGoal.createGoal({
      name: name.trim(),
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      description,
      image,
      walletId: wallet._id,
      priority,
    })

    res.status(201).json({ success: true, data: created })
  } catch (err) {
    console.error('Create goal error:', err)
    res.status(400).json({ success: false, error: err.message || 'Failed to create goal' })
  }
}

export const updateGoal = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    const existing = await SavingGoal.findById(id).populate('walletId', 'isShared ownerId userId members status')
    if (!existing) return res.status(404).json({ error: 'Not found' })

    const wallet = existing.walletId
    if (!wallet || !canViewWallet(wallet, userId) || wallet.status !== 'active') {
      return res.status(404).json({ error: 'Not found' })
    }
    if (wallet.isShared && !canEditWallet(wallet, userId)) {
      return res.status(403).json({ error: 'Insufficient permission' })
    }

    const updates = {}
    const allowed = ['name', 'targetAmount', 'currentAmount', 'deadline', 'description', 'image', 'walletId', 'status', 'priority']
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    if (updates.name !== undefined && (!updates.name || !String(updates.name).trim())) {
      return res.status(400).json({ error: 'Invalid name' })
    }
    if (updates.targetAmount !== undefined && (typeof updates.targetAmount !== 'number' || updates.targetAmount <= 0)) {
      return res.status(400).json({ error: 'Invalid targetAmount' })
    }
    if (updates.currentAmount !== undefined && (typeof updates.currentAmount !== 'number' || updates.currentAmount < 0)) {
      return res.status(400).json({ error: 'Invalid currentAmount' })
    }
    if (updates.walletId && !mongoose.Types.ObjectId.isValid(updates.walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }
    if (updates.walletId !== undefined) {
      return res.status(400).json({ error: 'walletId cannot be changed' })
    }
    if (updates.name) updates.name = String(updates.name).trim()

    // handle completion timestamp
    if (updates.status === 'completed') updates.completedAt = new Date()
    if (updates.status && updates.status !== 'completed') updates.completedAt = null

    if (updates.name) {
      const dup = await SavingGoal.findOne({ _id: { $ne: id }, walletId: existing.walletId?._id, name: updates.name })
      if (dup) return res.status(409).json({ error: 'Goal name already exists in this wallet' })
    }

    const goal = await SavingGoal.findOneAndUpdate({ _id: id }, updates, {
      new: true,
      runValidators: true,
    })
    if (!goal) return res.status(404).json({ error: 'Not found' })

    res.json({ success: true, data: goal.getDisplayInfo() })
  } catch (err) {
    console.error('Update goal error:', err)
    res.status(400).json({ success: false, error: err.message || 'Failed to update goal' })
  }
}

export const deleteGoal = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    const goal = await SavingGoal.findById(id).populate('walletId', 'isShared ownerId userId members status')
    if (!goal) return res.status(404).json({ error: 'Not found' })

    const wallet = goal.walletId
    if (!wallet || !canViewWallet(wallet, userId) || wallet.status !== 'active') {
      return res.status(404).json({ error: 'Not found' })
    }
    if (wallet.isShared && !canEditWallet(wallet, userId)) {
      return res.status(403).json({ error: 'Insufficient permission' })
    }

    const removed = await SavingGoal.findOneAndDelete({ _id: id })
    if (!removed) return res.status(404).json({ error: 'Not found' })

    res.json({ success: true })
  } catch (err) {
    console.error('Delete goal error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// M3-06: Contribute to a saving goal and create a linked wallet transaction
// POST /api/goals/:id/contribute
// Body: { amount, walletId?, date?, note? }
export const contributeToGoal = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, error: 'Invalid id' })

    const amount = req.body.amount
    const note = req.body.note
    const date = req.body.date

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' })
    }

    const result = await withMongoSession(async (session) => {
      const goal = await SavingGoal.findById(id).session(session)
      if (!goal) {
        const err = new Error('Not found')
        err.status = 404
        throw err
      }
      if (goal.status !== 'active') {
        const err = new Error('Cannot contribute to inactive goal')
        err.status = 400
        throw err
      }

      if (!goal.walletId) {
        const err = new Error('Goal wallet is missing')
        err.status = 400
        throw err
      }

      const effectiveWalletId = goal.walletId
      const wallet = await Wallet.findById(effectiveWalletId).session(session)
      if (!wallet || !canViewWallet(wallet, userId) || wallet.status !== 'active') {
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }
      if (wallet.isShared && !canEditWallet(wallet, userId)) {
        const err = new Error('Insufficient permission')
        err.status = 403
        throw err
      }
      if (wallet.currentBalance < amount) {
        const err = new Error('Insufficient wallet balance')
        err.status = 400
        throw err
      }

      const tx = await Transaction.create([
        {
          userId,
          walletId: wallet._id,
          amount,
          type: 'expense',
          category: 'Saving Goal',
          date,
          note: note || `Contribution to goal: ${goal.name}`,
        },
      ], { session })

      wallet.currentBalance -= amount
      await wallet.save({ session })

      goal.contributions.push({
        amount,
        date: date ? new Date(date) : new Date(),
        note: note || '',
        transactionId: tx[0]._id,
      })
      goal.currentAmount += amount
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed'
        goal.completedAt = new Date()
      }
      await goal.save({ session })

      return { goal: goal.getDisplayInfo(), transaction: tx[0] }
    })

    res.status(201).json({ success: true, data: result })
  } catch (err) {
    console.error('Contribute to goal error:', err)
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' })
  }
}
