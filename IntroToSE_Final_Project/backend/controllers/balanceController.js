/**
 * Balance Controller
 * 
 * Xử lý requests liên quan đến balance tổng hợp của user
 */

import {
    getUserBalance,
    recalculateBalance,
    getBalanceHistory
} from '../services/balanceService.js'

/**
 * Controller: Lấy tổng balance của user
 * 
 * GET /api/balance
 * 
 * Response: {
 *   totalWalletBalance,
 *   totalBudgetBalance,
 *   totalSavingBalance,
 *   totalSavingTarget,
 *   summary
 * }
 */
export const getBalance = async (req, res) => {
    try {
        const userId = req.user?.id
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const balance = await getUserBalance(userId)
        res.json(balance)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
}

/**
 * Controller: Recalculate balance (verify & fix)
 * 
 * POST /api/balance/recalculate
 * 
 * Body: { walletId? } - Optional, nếu chỉ recalc 1 wallet
 * 
 * Response: {
 *   walletsFixed,
 *   budgetsFixed,
 *   goalsFixed
 * }
 */
export const recalculateBalanceController = async (req, res) => {
    try {
        const userId = req.user?.id
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const { walletId } = req.body

        const result = await recalculateBalance(userId, walletId)
        res.json({
            message: 'Balance recalculated successfully',
            ...result
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
}

/**
 * Controller: Lấy balance history
 * 
 * GET /api/balance/history?startDate=2025-01-01&endDate=2025-12-31
 * 
 * Query params:
 * - startDate: Start date (ISO string)
 * - endDate: End date (ISO string)
 * 
 * Response: [
 *   {
 *     date: '2025-01-01',
 *     income: 100000,
 *     expense: 50000,
 *     change: 50000,
 *     balance: 150000
 *   },
 *   ...
 * ]
 */
export const getBalanceHistoryController = async (req, res) => {
    try {
        const userId = req.user?.id
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const { startDate, endDate } = req.query

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' })
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' })
        }

        const history = await getBalanceHistory(userId, start, end)
        res.json(history)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
}

export default {
    getBalance,
    recalculateBalanceController,
    getBalanceHistoryController
}
