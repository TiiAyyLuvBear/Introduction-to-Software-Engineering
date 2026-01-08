import mongoose from 'mongoose'
import Budget from '../models/Budget.js'
import Transaction from '../models/Transaction.js'

function toDateMaybe(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function computeOverspend({ userId, walletId, categoryId, atDate }) {
  const when = atDate || new Date()

  const budget = await Budget.findOne({
    userId,
    walletId,
    categoryId: categoryId || null,
    status: 'active',
    startDate: { $lte: when },
    $or: [{ endDate: null }, { endDate: { $gte: when } }],
  }).sort({ createdAt: -1 })

  if (!budget) {
    return {
      budget: null,
      spent: 0,
      percentage: 0,
      isOverBudget: false,
    }
  }

  const start = budget.startDate
  const end = budget.endDate ? new Date(Math.min(budget.endDate.getTime(), when.getTime())) : when

  // Fix: Handle userId as String (if User model uses String _id) or ObjectId
  // Transaction schema uses String for walletId/categoryId/userId
  const match = {
    userId: userId,
    walletId: walletId,
    type: 'expense',
    date: { $gte: start, $lte: end },
  }
  if (categoryId) match.categoryId = categoryId

  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  const spent = rows[0]?.total || 0
  const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

  return {
    budget: budget.getDisplayInfo(),
    spent,
    percentage,
    isOverBudget: spent > budget.amount,
  }
}

export function parseOverspendQuery(query) {
  return {
    walletId: String(query.walletId || '').trim(),
    categoryId: String(query.categoryId || '').trim(),
    atDate: toDateMaybe(query.date),
  }
}
