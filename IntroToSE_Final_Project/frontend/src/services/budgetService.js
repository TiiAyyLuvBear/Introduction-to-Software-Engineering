/**
 * Budget Service
 *
 * Handles all budget-related API calls
 */

import api from './api.js'

/**
 * List all budgets
 *
 * @returns {Promise<Object>} List of budgets
 */
export async function listBudgets() {
    const res = await api.get('/budgets')
    return res?.data?.data || res?.data || []
}

/**
 * Create a new budget
 *
 * @param {Object} data - Budget data
 * @param {string} data.walletId - Wallet ID
 * @param {string} data.name - Budget name
 * @param {string} data.categoryId - Category ID
 * @param {number} data.amount - Budget amount
 * @param {string} data.period - Budget period (daily, weekly, monthly, yearly)
 * @param {string} data.startDate - Start date (ISO string)
 * @param {string} data.endDate - End date (ISO string)
 * @returns {Promise<Object>} Created budget
 */
export async function createBudget(data) {
    const res = await api.post('/budgets', data)
    return res?.data?.data || res?.data
}

/**
 * Get a budget by ID
 *
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Budget data
 */
export async function getBudget(id) {
    const res = await api.get(`/budgets/${encodeURIComponent(id)}`)
    return res?.data?.data || res?.data
}

/**
 * Update a budget
 *
 * @param {string} id - Budget ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated budget
 */
export async function updateBudget(id, data) {
    const res = await api.put(`/budgets/${encodeURIComponent(id)}`, data)
    return res?.data?.data || res?.data
}

/**
 * Delete a budget
 *
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Response
 */
export async function deleteBudget(id) {
    const res = await api.delete(`/budgets/${encodeURIComponent(id)}`)
    return res?.data
}

export default {
    listBudgets,
    createBudget,
    getBudget,
    updateBudget,
    deleteBudget,
}
