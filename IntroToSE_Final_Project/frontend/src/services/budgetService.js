// /**
//  * Budget Service
//  *
//  * Handles all budget-related API calls
//  */

// import { get, post, del } from './api.js'

// /**
//  * List all budgets
//  *
//  * @returns {Promise<Object>} List of budgets
//  */
// export async function listBudgets() {
//     return get('/budgets')
// }

// /**
//  * Create a new budget
//  *
//  * @param {Object} data - Budget data
//  * @param {string} data.walletId - Wallet ID
//  * @param {string} data.name - Budget name
//  * @param {string} data.categoryId - Category ID
//  * @param {number} data.amount - Budget amount
//  * @param {string} data.period - Budget period (daily, weekly, monthly, yearly)
//  * @param {string} data.startDate - Start date (ISO string)
//  * @param {string} data.endDate - End date (ISO string)
//  * @returns {Promise<Object>} Created budget
//  */
// export async function createBudget({ walletId, name, categoryId, amount, period, startDate, endDate }) {
//     return post('/budgets', { walletId, name, categoryId, amount, period, startDate, endDate })
// }

// /**
//  * Delete a budget
//  *
//  * @param {string} id - Budget ID
//  * @returns {Promise<Object>} Response
//  */
// export async function deleteBudget(id) {
//     return del(`/budgets/${encodeURIComponent(id)}`)
// }

// export default {
//     listBudgets,
//     createBudget,
//     deleteBudget,
// }
