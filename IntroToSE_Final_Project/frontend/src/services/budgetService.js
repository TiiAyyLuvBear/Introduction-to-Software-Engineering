/**
 * Budget Service
 * Handles all budget-related API calls
 */

import { get, post, del, put } from './api.js'

/**
 * List all budgets
 * @returns {Promise<Object>} List of budgets
 */
export async function listBudgets(params) {
    return get('/budgets', params)
}

/**
 * Create a new budget
 */
export async function createBudget(data) {
    return post('/budgets', data)
}

/**
 * Delete a budget
 */
export async function deleteBudget(id) {
    return del(`/budgets/${id}`)
}

/**
 * Update a budget
 */
export async function updateBudget(id, data) {
    return put(`/budgets/${id}`, data)
}

export default {
    listBudgets,
    createBudget,
    deleteBudget,
    updateBudget
}
