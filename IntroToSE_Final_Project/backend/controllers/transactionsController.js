import Transaction from '../models/Transaction.js'

/**
 * Controller: Lấy danh sách transactions
 * 
 * Endpoint: GET /api/transactions
 * 
 * Sort: Theo ngày mới nhất (date descending)
 * Limit: 200 transactions gần nhất
 * 
 * TODO: Thêm pagination, filter theo:
 * - userId (chỉ lấy transactions của user hiện tại)
 * - type (income/expense)
 * - category
 * - account
 * - date range (từ ngày X đến ngày Y)
 * 
 * Use case:
 * - Dashboard: Hiển thị 5-10 transactions gần nhất
 * - Transactions page: Hiển thị tất cả với filter
 * - Reports: Tính tổng thu/chi theo tháng/năm
 */
export async function getTransactions(req, res) {
  try {
    // Sort theo date giảm dần (-1) để lấy mới nhất
    const list = await Transaction.find().sort({ date: -1 }).limit(200)
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

import Budget from '../models/Budget.js'
import Wallet from '../models/Wallet.js'
import { checkOverspend } from '../utils/budgetUtils.js'

export async function createTransaction(req, res) {
  try {
    const { amount, type, category, account, date, note, walletId } = req.body
    const userId = req.body.userId || req.user?.id
    const categoryId = category // Map category from body to categoryId for Budget lookup

    // ... validation and wallet update ...
    if (typeof amount !== 'number' || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid payload' })
    }

    if (!walletId) {
      return res.status(400).json({ error: 'Wallet ID is required' })
    }

    // 1. Update Wallet Balance
    const wallet = await Wallet.findById(walletId)
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' })

    if (type === 'expense' && wallet.currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' })
    }

    if (type === 'income') {
      wallet.currentBalance += amount
    } else {
      wallet.currentBalance -= amount
    }
    await wallet.save()

    // 2. Create Transaction
    const txDate = date || new Date()
    const tx = new Transaction({
      userId,
      walletId,
      amount,
      type,
      category,
      account: account || wallet.name,
      date: txDate,
      note
    })
    await tx.save()

    // 3. TC19: Check Overspend Alert (Only for Expense)
    let alert = null
    if (type === 'expense') {
      // Update Budget Spent Amount first!
      // We need to find budgets that match this transaction date and category
      // Since we don't know the exact budget period start/end easily without querying,
      // we can trigger update for all budgets of this user/category.
      // Budget.updateSpentAmount calculates spent for a specific period.

      // Let's iterate user active budgets and update relevant ones? 
      // Or simpler: checkOverspend could handle calculation?
      // checkOverspend relies on `budget.getSpendingPercentage`, which relies on `budget.spent`.

      // Better approach: Find active budget(s) for this wallet/category and update them.
      const activeBudgets = await Budget.find({
        userId,
        walletId,
        categoryId,
        status: 'active',
        startDate: { $lte: txDate },
        $or: [{ endDate: { $gte: txDate } }, { endDate: null }]
      })

      for (const budget of activeBudgets) {
        const start = budget.startDate
        const end = budget.endDate || new Date(9999, 11, 31) // Infinity

        // Update this budget's spent
        const spent = await Budget.updateSpentAmount(userId, walletId, categoryId, start, end)
        // Refresh budget object with new spent
        budget.spent = spent
      }

      const percentage = await checkOverspend(walletId, category)
      if (percentage !== null && percentage >= 100) {
        alert = "Budget Exceeded"
      }
    }

    res.status(201).json({ ...tx.toObject(), alert })
  } catch (err) {
    // ... error handling ...
    console.error(err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
}

/**
 * Controller: Xóa transaction
 * 
 * Endpoint: DELETE /api/transactions/:id
 * 
 * TODO: Khi xóa transaction, cần điều chỉnh lại balance của account:
 * - Nếu xóa income: account.balance -= amount
 * - Nếu xóa expense: account.balance += amount
 * 
 * Use case:
 * - Xóa transaction nhập nhầm
 * - Xóa transaction trùng
 * - Undo sau khi ghi sai
 */
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params
    const t = await Transaction.findByIdAndDelete(id)
    if (!t) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params
    const { amount, type, category, account, date, note } = req.body
    if (typeof amount !== 'number' || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    const updated = await Transaction.findByIdAndUpdate(
      id,
      { amount, type, category, account, date, note },
      { new: true }
    )
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
