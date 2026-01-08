/**
 * Goal Service
 *
 * Handles all saving goal-related API calls
 */

import api from './api.js'

/**
 * List all goals
 *
 * @returns {Promise<Object>} List of goals
 */
export async function listGoals() {
    const res = await api.get('/goals')
    return res?.data?.data || res?.data || []
}

/**
 * Get a specific goal
 *
 * @param {string} id - Goal ID
 * @returns {Promise<Object>} Goal details
 */
export async function getGoal(id) {
    const res = await api.get(`/goals/${encodeURIComponent(id)}`)
    return res?.data?.data || res?.data
}

/**
 * Create a new goal
 *
 * @param {Object} data - Goal data
 * @returns {Promise<Object>} Created goal
 */
export async function createGoal(data) {
    // Backend expects: { name, targetAmount, currentAmount, deadline, description, image, walletId, priority }
    const res = await api.post('/goals', data)
    return res?.data?.data || res?.data
}

/**
 * Contribute to a goal
 *
 * @param {string} goalId - Goal ID
 * @param {Object} data - Contribution data
 * @returns {Promise<Object>} Updated goal
 */
export async function contributeToGoal(goalId, { amount, walletId, date, note } = {}) {
    const res = await api.post(`/goals/${encodeURIComponent(goalId)}/contribute`, { amount, walletId, date, note })
    return res?.data?.data || res?.data
}

export async function deleteGoal(id) {
    const res = await api.delete(`/goals/${encodeURIComponent(id)}`)
    return res?.data
}

export default {
    listGoals,
    getGoal,
    createGoal,
    contributeToGoal,
    deleteGoal,
}
