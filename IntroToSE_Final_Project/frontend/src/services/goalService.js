/**
 * Goal Service
 * Handles all saving goal-related API calls
 */

import { get, post, del, put } from './api.js'

/**
 * List all goals
 */
export async function listGoals(params) {
    return get('/saving-goals', params)
}

/**
 * Get a specific goal
 */
export async function getGoal(id) {
    return get(`/saving-goals/${encodeURIComponent(id)}`)
}

/**
 * Create a new goal
 */
export async function createGoal(data) {
    return post('/saving-goals', data)
}

/**
 * Update a goal
 */
export async function updateGoal(id, data) {
    return put(`/saving-goals/${id}`, data)
}

/**
 * Delete a goal
 */
export async function deleteGoal(id) {
    return del(`/saving-goals/${id}`)
}

/**
 * Contribute to a goal
 * Backend: POST /api/saving-goals/:id/contributions
 */
export async function contributeToGoal(goalId, data) {
    return post(`/saving-goals/${encodeURIComponent(goalId)}/contributions`, data)
}

export default {
    listGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal
}
