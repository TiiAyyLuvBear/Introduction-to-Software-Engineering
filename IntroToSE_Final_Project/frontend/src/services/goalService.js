// /**
//  * Goal Service
//  *
//  * Handles all saving goal-related API calls
//  */

// import { get, post } from './api.js'

// /**
//  * List all goals
//  *
//  * @returns {Promise<Object>} List of goals
//  */
// export async function listGoals() {
//     return get('/goals')
// }

// /**
//  * Get a specific goal
//  *
//  * @param {string} id - Goal ID
//  * @returns {Promise<Object>} Goal details
//  */
// export async function getGoal(id) {
//     return get(`/goals/${encodeURIComponent(id)}`)
// }

// /**
//  * Create a new goal
//  *
//  * @param {Object} data - Goal data
//  * @param {string} data.name - Goal name
//  * @param {number} data.targetAmount - Target amount
//  * @param {string} data.deadline - Deadline date (ISO string)
//  * @param {string} data.priority - Priority (low, medium, high)
//  * @returns {Promise<Object>} Created goal
//  */
// export async function createGoal({ name, targetAmount, deadline, priority }) {
//     return post('/goals', { name, targetAmount, deadline, priority })
// }

// /**
//  * Contribute to a goal
//  *
//  * @param {string} goalId - Goal ID
//  * @param {Object} data - Contribution data
//  * @param {number} data.amount - Contribution amount
//  * @param {string} data.walletId - Wallet ID
//  * @param {string} data.date - Contribution date (ISO string)
//  * @param {string} data.note - Contribution note
//  * @returns {Promise<Object>} Updated goal
//  */
// export async function contributeToGoal(goalId, { amount, walletId, date, note } = {}) {
//     return post(`/goals/${encodeURIComponent(goalId)}/contribute`, { amount, walletId, date, note })
// }

// export default {
//     listGoals,
//     getGoal,
//     createGoal,
//     contributeToGoal,
// }
