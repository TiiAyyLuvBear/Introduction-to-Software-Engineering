import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import Wallet from '../models/Wallet.js'

function parseDateMaybe(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

async function getAccessibleWalletIds(userId) {
  const wallets = await Wallet.find({
    status: 'active',
    $or: [{ userId }, { ownerId: userId }, { 'members.userId': userId }],
  }).select('_id')

  // Transaction.walletId is stored as String, so use string ids here.
  return wallets.map((w) => w._id.toString())
}

function buildMatch(walletIds, startDate, endDate, walletId) {
  const match = {}

  if (walletId) {
    match.walletId = walletId
  } else {
    match.walletId = { $in: walletIds }
  }

  if (startDate || endDate) {
    match.date = {}
    if (startDate) match.date.$gte = startDate
    if (endDate) match.date.$lte = endDate
  }
  return match
}

function escapeCsv(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export const getSummary = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const startDate = parseDateMaybe(req.query.startDate)
    const endDate = parseDateMaybe(req.query.endDate)
    const walletId = req.query.walletId
    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }

    const walletIds = await getAccessibleWalletIds(userId)
    if (walletId) {
      const allowed = walletIds.some((id) => id.toString() === walletId)
      if (!allowed) return res.status(404).json({ error: 'Wallet not found' })
    }

    const match = buildMatch(walletIds, startDate, endDate, walletId)

    const rows = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ])

    const income = rows.find(r => r._id === 'income')?.total || 0
    const expense = rows.find(r => r._id === 'expense')?.total || 0
    const count = rows.reduce((s, r) => s + (r.count || 0), 0)

    res.json({
      success: true,
      data: {
        income,
        expense,
        net: income - expense,
        count,
      },
    })
  } catch (err) {
    console.error('Report summary error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

export const getByCategory = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const startDate = parseDateMaybe(req.query.startDate)
    const endDate = parseDateMaybe(req.query.endDate)
    const type = req.query.type
    const walletId = req.query.walletId
    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' })
    }

    const walletIds = await getAccessibleWalletIds(userId)
    if (walletId) {
      const allowed = walletIds.some((id) => id.toString() === walletId)
      if (!allowed) return res.status(404).json({ error: 'Wallet not found' })
    }

    const match = buildMatch(walletIds, startDate, endDate, walletId)
    if (type) match.type = type

    const rows = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { categoryId: '$categoryId', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])

    res.json({
      success: true,
      data: rows.map(r => ({
        categoryId: r._id.categoryId || null,
        category: r._id.category || null,
        total: r.total,
        count: r.count,
      })),
    })
  } catch (err) {
    console.error('Report by-category error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

export const getByWallet = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const startDate = parseDateMaybe(req.query.startDate)
    const endDate = parseDateMaybe(req.query.endDate)
    const type = req.query.type
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' })
    }

    const walletIds = await getAccessibleWalletIds(userId)
    const match = buildMatch(walletIds, startDate, endDate, null)
    if (type) match.type = type

    const rows = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$walletId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])

    res.json({
      success: true,
      data: rows.map(r => ({
        walletId: r._id,
        total: r.total,
        count: r.count,
      })),
    })
  } catch (err) {
    console.error('Report by-wallet error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// M4-05: Pie chart report (alias of by-category)
export const getPieChart = async (req, res) => getByCategory(req, res)

// M4-06: Bar chart report grouped by time
// GET /api/reports/bar-chart?startDate&endDate&walletId&type&interval=day|month
export const getBarChart = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const startDate = parseDateMaybe(req.query.startDate)
    const endDate = parseDateMaybe(req.query.endDate)
    const walletId = req.query.walletId
    const type = req.query.type
    const interval = (req.query.interval || 'day').toString().toLowerCase()

    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' })
    }
    if (!['day', 'month'].includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval' })
    }

    const walletIds = await getAccessibleWalletIds(userId)
    if (walletId) {
      const allowed = walletIds.some((id) => id.toString() === walletId)
      if (!allowed) return res.status(404).json({ error: 'Wallet not found' })
    }

    const match = buildMatch(walletIds, startDate, endDate, walletId)
    if (type) match.type = type

    const format = interval === 'month' ? '%Y-%m' : '%Y-%m-%d'

    const rows = await Transaction.aggregate([
      { $match: match },
      { $addFields: { bucket: { $dateToString: { format, date: '$date' } } } },
      {
        $group: {
          _id: '$bucket',
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json({
      success: true,
      data: rows.map(r => ({
        period: r._id,
        income: r.income,
        expense: r.expense,
        net: r.income - r.expense,
        count: r.count,
      })),
    })
  } catch (err) {
    console.error('Report bar-chart error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// M4-07 (Optional): export transactions to CSV
// GET /api/reports/export-transactions?startDate&endDate&walletId&type&q
export const exportTransactions = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const startDate = parseDateMaybe(req.query.startDate)
    const endDate = parseDateMaybe(req.query.endDate)
    const walletId = req.query.walletId
    const type = req.query.type
    const q = (req.query.q || req.query.search || '').toString().trim()

    if (walletId && !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ error: 'Invalid walletId' })
    }
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' })
    }

    const walletIds = await getAccessibleWalletIds(userId)
    if (walletId) {
      const allowed = walletIds.some((id) => id.toString() === walletId)
      if (!allowed) return res.status(404).json({ error: 'Wallet not found' })
    }

    const match = buildMatch(walletIds, startDate, endDate, walletId)
    if (type) match.type = type
    if (q) {
      match.note = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    }

    const rows = await Transaction.find(match)
      .sort({ date: -1 })
      .select('_id date type amount walletId categoryId category note')
      .lean()

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"')

    const header = ['id', 'date', 'type', 'amount', 'walletId', 'categoryId', 'category', 'note']
    const lines = [header.join(',')]

    for (const r of rows) {
      lines.push(
        [
          escapeCsv(r._id),
          escapeCsv(r.date ? new Date(r.date).toISOString() : ''),
          escapeCsv(r.type),
          escapeCsv(r.amount),
          escapeCsv(r.walletId),
          escapeCsv(r.categoryId),
          escapeCsv(r.category),
          escapeCsv(r.note),
        ].join(',')
      )
    }

    res.send(lines.join('\n'))
  } catch (err) {
    console.error('Export transactions error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
