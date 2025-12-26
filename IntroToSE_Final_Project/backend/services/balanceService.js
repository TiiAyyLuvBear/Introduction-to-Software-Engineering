/**
 * Balance Service - Quản lý tổng hợp balance của user
 * 
 * Balance của user bao gồm:
 * 1. Wallet Balance - Số tiền trong các ví
 * 2. Budget Balance - Ngân sách đã chi/còn lại
 * 3. Saving Goal Balance - Tiến độ tiết kiệm
 * 
 * Chiến lược:
 * - Stored Balance: Lưu balance trong DB để query nhanh
 * - Auto Update: Tự động cập nhật khi có transaction
 * - MongoDB Session: Đảm bảo ACID
 * - Recalculate: Function để verify và fix balance
 */

import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import Wallet from '../models/Wallet.js'
import Budget from '../models/Budget.js'
import SavingGoal from '../models/SavingGoal.js'
import { withMongoSession } from '../utils/mongoSession.js'

/**
 * Helper: Tính số tiền có dấu
 */
function signedAmount(type, amount) {
    return type === 'income' ? amount : -amount
}

/**
 * Service: Lấy tổng balance của user
 * 
 * @param {String} userId - User ID
 * @returns {Object} { totalWalletBalance, totalBudgetBalance, totalSavingBalance, summary }
 */
export const getUserBalance = async (userId) => {
    // 1. Tổng balance từ tất cả wallets
    const wallets = await Wallet.find({
        $or: [
            { userId },
            { ownerId: userId },
            { 'members.userId': userId }
        ]
    })

    const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0)

    // 2. Tổng budget balance (ngân sách còn lại)
    const budgets = await Budget.find({
        userId,
        isActive: true
    })

    const totalBudgetBalance = budgets.reduce((sum, b) => {
        const spent = b.spent || 0
        const limit = b.limit || 0
        const remaining = limit - spent
        return sum + remaining
    }, 0)

    // 3. Tổng saving goal balance (đã tiết kiệm)
    const goals = await SavingGoal.find({
        userId,
        status: { $in: ['active', 'in_progress'] }
    })

    const totalSavingBalance = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
    const totalSavingTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0)

    return {
        totalWalletBalance,
        totalBudgetBalance,
        totalSavingBalance,
        totalSavingTarget,
        summary: {
            availableCash: totalWalletBalance,
            budgetRemaining: totalBudgetBalance,
            savingsProgress: totalSavingBalance,
            savingsTarget: totalSavingTarget,
            savingsPercentage: totalSavingTarget > 0
                ? Math.round((totalSavingBalance / totalSavingTarget) * 100)
                : 0
        }
    }
}

/**
 * Service: Cập nhật balance khi có transaction mới
 * 
 * Flow:
 * 1. Cập nhật Wallet balance
 * 2. Cập nhật Budget spent (nếu là expense)
 * 3. Cập nhật Saving Goal (nếu có liên kết)
 * 
 * Sử dụng MongoDB Session để đảm bảo tất cả updates thành công hoặc rollback
 * 
 * @param {String} userId - User ID
 * @param {Object} transaction - Transaction object
 * @param {Object} session - MongoDB session (optional)
 */
export const updateBalanceOnTransaction = async (userId, transaction, session = null) => {
    const executeUpdate = async (sess) => {
        const { walletId, categoryId, amount, type, date } = transaction

        // 1. Cập nhật Wallet Balance (đã được xử lý trong transactionsService)
        // Không cần làm gì thêm vì đã update trong createTransaction

        // 2. Cập nhật Budget spent (nếu là expense)
        if (type === 'expense' && categoryId) {
            // Tìm budget active cho category này trong tháng hiện tại
            const transactionDate = new Date(date || Date.now())
            const startOfMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1)
            const endOfMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 0)

            const budget = await Budget.findOne({
                userId,
                categoryId,
                isActive: true,
                startDate: { $lte: endOfMonth },
                endDate: { $gte: startOfMonth }
            }).session(sess)

            if (budget) {
                budget.spent = (budget.spent || 0) + amount
                await budget.save({ session: sess })

                // Check overspending
                if (budget.spent > budget.limit) {
                    console.warn(`Budget overspending detected: ${budget.name} (${budget.spent}/${budget.limit})`)
                    // TODO: Trigger notification
                }
            }
        }

        // 3. Cập nhật Saving Goal (nếu transaction có goalId)
        if (transaction.goalId) {
            const goal = await SavingGoal.findById(transaction.goalId).session(sess)

            if (goal) {
                // Nếu là income vào saving goal
                if (type === 'income') {
                    goal.currentAmount = (goal.currentAmount || 0) + amount
                } else {
                    // Nếu là expense từ saving goal (rút tiền)
                    goal.currentAmount = (goal.currentAmount || 0) - amount
                }

                // Update status based on progress
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                if (progress >= 100) {
                    goal.status = 'completed'
                } else if (progress > 0) {
                    goal.status = 'in_progress'
                }

                await goal.save({ session: sess })
            }
        }

        return true
    }

    // Nếu đã có session từ bên ngoài, dùng luôn
    if (session) {
        return executeUpdate(session)
    }

    // Nếu không, tạo session mới
    return withMongoSession(executeUpdate)
}

/**
 * Service: Rollback balance khi xóa/update transaction
 * 
 * @param {String} userId - User ID
 * @param {Object} oldTransaction - Transaction cũ
 * @param {Object} session - MongoDB session
 */
export const rollbackBalanceOnTransaction = async (userId, oldTransaction, session) => {
    const { walletId, categoryId, amount, type, date, goalId } = oldTransaction

    // 1. Rollback Wallet Balance (đã được xử lý trong transactionsService)

    // 2. Rollback Budget spent
    if (type === 'expense' && categoryId) {
        const transactionDate = new Date(date || Date.now())
        const startOfMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1)
        const endOfMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 0)

        const budget = await Budget.findOne({
            userId,
            categoryId,
            isActive: true,
            startDate: { $lte: endOfMonth },
            endDate: { $gte: startOfMonth }
        }).session(session)

        if (budget) {
            budget.spent = Math.max(0, (budget.spent || 0) - amount)
            await budget.save({ session })
        }
    }

    // 3. Rollback Saving Goal
    if (goalId) {
        const goal = await SavingGoal.findById(goalId).session(session)

        if (goal) {
            if (type === 'income') {
                goal.currentAmount = Math.max(0, (goal.currentAmount || 0) - amount)
            } else {
                goal.currentAmount = (goal.currentAmount || 0) + amount
            }

            // Update status
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            if (progress >= 100) {
                goal.status = 'completed'
            } else if (progress > 0) {
                goal.status = 'in_progress'
            } else {
                goal.status = 'active'
            }

            await goal.save({ session })
        }
    }

    return true
}

/**
 * Service: Recalculate balance từ transactions (verify & fix)
 * 
 * Dùng khi:
 * - Nghi ngờ balance không chính xác
 * - Sau khi import data
 * - Maintenance/cleanup
 * 
 * @param {String} userId - User ID
 * @param {String} walletId - Wallet ID (optional, nếu chỉ recalc 1 wallet)
 * @returns {Object} { walletsFixed, budgetsFixed, goalsFixed }
 */
export const recalculateBalance = async (userId, walletId = null) => {
    return withMongoSession(async (session) => {
        let walletsFixed = 0
        let budgetsFixed = 0
        let goalsFixed = 0

        // 1. Recalculate Wallet Balance
        const walletFilter = walletId
            ? { _id: walletId }
            : {
                $or: [
                    { userId },
                    { ownerId: userId },
                    { 'members.userId': userId }
                ]
            }

        const wallets = await Wallet.find(walletFilter).session(session)

        for (const wallet of wallets) {
            // Tính balance từ transactions
            const transactions = await Transaction.find({ walletId: wallet._id })

            const calculatedBalance = transactions.reduce((sum, tx) => {
                return sum + signedAmount(tx.type, tx.amount)
            }, 0)

            // So sánh và fix nếu khác
            if (Math.abs(wallet.currentBalance - calculatedBalance) > 0.01) {
                console.log(`Fixing wallet ${wallet.name}: ${wallet.currentBalance} -> ${calculatedBalance}`)
                wallet.currentBalance = calculatedBalance
                await wallet.save({ session })
                walletsFixed++
            }
        }

        // 2. Recalculate Budget spent
        const budgets = await Budget.find({ userId, isActive: true }).session(session)

        for (const budget of budgets) {
            const startDate = new Date(budget.startDate)
            const endDate = new Date(budget.endDate)

            // Tính spent từ transactions
            const transactions = await Transaction.find({
                userId,
                categoryId: budget.categoryId,
                type: 'expense',
                date: { $gte: startDate, $lte: endDate }
            })

            const calculatedSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0)

            // Fix nếu khác
            if (Math.abs(budget.spent - calculatedSpent) > 0.01) {
                console.log(`Fixing budget ${budget.name}: ${budget.spent} -> ${calculatedSpent}`)
                budget.spent = calculatedSpent
                await budget.save({ session })
                budgetsFixed++
            }
        }

        // 3. Recalculate Saving Goal
        const goals = await SavingGoal.find({
            userId,
            status: { $in: ['active', 'in_progress', 'completed'] }
        }).session(session)

        for (const goal of goals) {
            // Tính currentAmount từ transactions có goalId
            const transactions = await Transaction.find({
                userId,
                goalId: goal._id
            })

            const calculatedAmount = transactions.reduce((sum, tx) => {
                return sum + signedAmount(tx.type, tx.amount)
            }, 0)

            // Fix nếu khác
            if (Math.abs(goal.currentAmount - calculatedAmount) > 0.01) {
                console.log(`Fixing goal ${goal.name}: ${goal.currentAmount} -> ${calculatedAmount}`)
                goal.currentAmount = Math.max(0, calculatedAmount)

                // Update status
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                if (progress >= 100) {
                    goal.status = 'completed'
                } else if (progress > 0) {
                    goal.status = 'in_progress'
                } else {
                    goal.status = 'active'
                }

                await goal.save({ session })
                goalsFixed++
            }
        }

        return { walletsFixed, budgetsFixed, goalsFixed }
    })
}

/**
 * Service: Lấy balance history (theo thời gian)
 * 
 * @param {String} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Balance history by day
 */
export const getBalanceHistory = async (userId, startDate, endDate) => {
    const transactions = await Transaction.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 })

    // Group by date và tính cumulative balance
    const history = []
    let cumulativeBalance = 0

    // Get initial balance (before startDate)
    const initialTransactions = await Transaction.find({
        userId,
        date: { $lt: startDate }
    })

    cumulativeBalance = initialTransactions.reduce((sum, tx) => {
        return sum + signedAmount(tx.type, tx.amount)
    }, 0)

    // Build history
    const dateMap = new Map()

    transactions.forEach(tx => {
        const dateKey = tx.date.toISOString().split('T')[0]
        const change = signedAmount(tx.type, tx.amount)

        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {
                date: dateKey,
                income: 0,
                expense: 0,
                change: 0,
                balance: 0
            })
        }

        const dayData = dateMap.get(dateKey)
        if (tx.type === 'income') {
            dayData.income += tx.amount
        } else {
            dayData.expense += tx.amount
        }
        dayData.change += change
    })

    // Convert to array and calculate cumulative balance
    dateMap.forEach((dayData, dateKey) => {
        cumulativeBalance += dayData.change
        dayData.balance = cumulativeBalance
        history.push(dayData)
    })

    return history
}

export default {
    getUserBalance,
    updateBalanceOnTransaction,
    rollbackBalanceOnTransaction,
    recalculateBalance,
    getBalanceHistory
}
