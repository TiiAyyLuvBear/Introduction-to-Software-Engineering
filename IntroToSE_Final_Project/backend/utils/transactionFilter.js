import mongoose from 'mongoose'

function parseIntSafe(value, fallback) {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function parseDateMaybe(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * M4-04 Filter helper for Transactions API
 * Supports: note search, sort, pagination, wallet/category/type, date range.
 */
export function buildTransactionQuery({ userId, query }) {
  const filter = { userId }

  const walletId = String(query.walletId || '').trim()
  const categoryId = String(query.categoryId || '').trim()
  const type = String(query.type || '').trim()

  if (walletId && mongoose.Types.ObjectId.isValid(walletId)) {
    filter.walletId = walletId
  }
  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    filter.categoryId = categoryId
  }
  if (type && ['income', 'expense'].includes(type)) {
    filter.type = type
  }

  const startDate = parseDateMaybe(query.startDate)
  const endDate = parseDateMaybe(query.endDate)
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = startDate
    if (endDate) filter.date.$lte = endDate
  }

  const q = String(query.q || query.search || '').trim()
  if (q) {
    filter.note = { $regex: escapeRegex(q), $options: 'i' }
  }

  const sortBy = String(query.sortBy || 'date')
  const sortDir = String(query.sortDir || query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1
  const sort = sortBy === 'amount' ? { amount: sortDir, date: -1 } : { date: sortDir }

  const page = Math.max(1, parseIntSafe(query.page, 1))
  const limit = Math.min(200, Math.max(1, parseIntSafe(query.limit, 200)))
  const skip = (page - 1) * limit

  return { filter, sort, limit, skip }
}
