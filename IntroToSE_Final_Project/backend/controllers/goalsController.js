import mongoose from 'mongoose'
import SavingGoal from '../models/SavingGoal.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import { withMongoSession } from '../utils/mongoSession.js'

function canAccessWallet(wallet, userId) {
  if (!wallet || !userId) return false
  const uid = userId.toString()
  if (wallet.userId?.toString() === uid) return true
  if (wallet.ownerId?.toString() === uid) return true
  if (Array.isArray(wallet.members) && wallet.members.some(m => m.userId?.toString() === uid)) return true
  return false
}

export const getGoals = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { status, priority } = req.query
    const goals = await SavingGoal.getUserGoals(userId, { status, priority })
    res.json({ success: true, data: goals })
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

    const goal = await SavingGoal.findOne({ _id: id, userId }).populate('walletId', 'name type currentBalance')
    if (!goal) return res.status(404).json({ error: 'Not found' })

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
    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) return res.status(400).json({ error: 'Invalid walletId' })

    const created = await SavingGoal.createGoal({
      userId,
      name: name.trim(),
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      description,
      image,
      walletId: walletId || undefined,
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
    if (updates.walletId === null || updates.walletId === '') updates.walletId = undefined
    if (updates.name) updates.name = String(updates.name).trim()

    // handle completion timestamp
    if (updates.status === 'completed') updates.completedAt = new Date()
    if (updates.status && updates.status !== 'completed') updates.completedAt = null

    const goal = await SavingGoal.findOneAndUpdate({ _id: id, userId }, updates, {
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

    const removed = await SavingGoal.findOneAndDelete({ _id: id, userId })
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
    const walletId = req.body.walletId
    const note = req.body.note
    const date = req.body.date

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' })
    }

    const result = await withMongoSession(async (session) => {
      const goal = await SavingGoal.findOne({ _id: id, userId }).session(session)
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

      const effectiveWalletId = walletId || goal.walletId
      if (!effectiveWalletId || !mongoose.Types.ObjectId.isValid(effectiveWalletId)) {
        const err = new Error('walletId is required')
        err.status = 400
        throw err
      }

      const wallet = await Wallet.findById(effectiveWalletId).session(session)
      if (!wallet || !canAccessWallet(wallet, userId) || wallet.status !== 'active') {
        const err = new Error('Wallet not found')
        err.status = 404
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
      if (!goal.walletId) goal.walletId = wallet._id
      await goal.save({ session })

      return { goal: goal.getDisplayInfo(), transaction: tx[0] }
    })

    res.status(201).json({ success: true, data: result })
  } catch (err) {
    console.error('Contribute to goal error:', err)
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' })
  }
}
