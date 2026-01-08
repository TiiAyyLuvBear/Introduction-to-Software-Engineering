/**
 * Balance Service
 * 
 * Service để lấy tổng balance của user từ backend
 * Bao gồm: wallet balance, budget balance, saving goals balance
 */

import api from './api.js'

/**
 * Lấy tổng balance của user
 * 
 * @returns {Promise<{
 *   totalWalletBalance: number,
 *   totalBudgetBalance: number,
 *   totalSavingBalance: number,
 *   totalSavingTarget: number,
 *   summary: {
 *     availableCash: number,
 *     budgetRemaining: number,
 *     savingsProgress: number,
 *     savingsTarget: number,
 *     savingsPercentage: number
 *   }
 * }>}
 */
export const getUserBalance = async () => {
    const response = await api.get('/balance')
    return response.data
}

/**
 * Recalculate balance (verify và fix nếu có lỗi)
 * 
 * @param {string} walletId - Optional: ID của wallet cần recalculate
 * @returns {Promise}
 */
export const recalculateBalance = async (walletId) => {
    const response = await api.post('/balance/recalculate', { walletId })
    return response.data
}

/**
 * Lấy balance history theo thời gian
 * 
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise}
 */
export const getBalanceHistory = async (startDate, endDate) => {
    const response = await api.get('/balance/history', {
        params: { startDate, endDate }
    })
    return response.data
}

export default {
    getUserBalance,
    recalculateBalance,
    getBalanceHistory
}
