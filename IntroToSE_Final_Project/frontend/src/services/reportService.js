// /**
//  * Report Service
//  *
//  * Handles all report and analytics-related API calls
//  */

// import { get } from './api.js'

// /**
//  * Get summary report
//  *
//  * @param {Object} params - Query parameters
//  * @param {string} params.startDate - Start date (YYYY-MM-DD)
//  * @param {string} params.endDate - End date (YYYY-MM-DD)
//  * @param {string} params.walletId - Wallet ID
//  * @returns {Promise<Object>} Summary report
//  */
// export async function getSummary({ startDate, endDate, walletId } = {}) {
//     const qs = new URLSearchParams()
//     if (startDate) qs.set('startDate', startDate)
//     if (endDate) qs.set('endDate', endDate)
//     if (walletId) qs.set('walletId', walletId)
//     const suffix = qs.toString() ? `?${qs.toString()}` : ''
//     return get(`/reports/summary${suffix}`)
// }

// /**
//  * Get report by category
//  *
//  * @param {Object} params - Query parameters
//  * @param {string} params.startDate - Start date (YYYY-MM-DD)
//  * @param {string} params.endDate - End date (YYYY-MM-DD)
//  * @param {string} params.walletId - Wallet ID
//  * @param {string} params.type - Transaction type (income, expense)
//  * @returns {Promise<Object>} Category report
//  */
// export async function getByCategory({ startDate, endDate, walletId, type } = {}) {
//     const qs = new URLSearchParams()
//     if (startDate) qs.set('startDate', startDate)
//     if (endDate) qs.set('endDate', endDate)
//     if (walletId) qs.set('walletId', walletId)
//     if (type) qs.set('type', type)
//     const suffix = qs.toString() ? `?${qs.toString()}` : ''
//     return get(`/reports/by-category${suffix}`)
// }

// /**
//  * Get report by wallet
//  *
//  * @param {Object} params - Query parameters
//  * @param {string} params.startDate - Start date (YYYY-MM-DD)
//  * @param {string} params.endDate - End date (YYYY-MM-DD)
//  * @param {string} params.type - Transaction type (income, expense)
//  * @returns {Promise<Object>} Wallet report
//  */
// export async function getByWallet({ startDate, endDate, type } = {}) {
//     const qs = new URLSearchParams()
//     if (startDate) qs.set('startDate', startDate)
//     if (endDate) qs.set('endDate', endDate)
//     if (type) qs.set('type', type)
//     const suffix = qs.toString() ? `?${qs.toString()}` : ''
//     return get(`/reports/by-wallet${suffix}`)
// }

// /**
//  * Get bar chart data
//  *
//  * @param {Object} params - Query parameters
//  * @param {string} params.startDate - Start date (YYYY-MM-DD)
//  * @param {string} params.endDate - End date (YYYY-MM-DD)
//  * @param {string} params.walletId - Wallet ID
//  * @param {string} params.type - Transaction type (income, expense)
//  * @param {string} params.interval - Time interval (day, week, month, year)
//  * @returns {Promise<Object>} Bar chart data
//  */
// export async function getBarChart({ startDate, endDate, walletId, type, interval } = {}) {
//     const qs = new URLSearchParams()
//     if (startDate) qs.set('startDate', startDate)
//     if (endDate) qs.set('endDate', endDate)
//     if (walletId) qs.set('walletId', walletId)
//     if (type) qs.set('type', type)
//     if (interval) qs.set('interval', interval)
//     const suffix = qs.toString() ? `?${qs.toString()}` : ''
//     return get(`/reports/bar-chart${suffix}`)
// }

// export default {
//     getSummary,
//     getByCategory,
//     getByWallet,
//     getBarChart,
// }
