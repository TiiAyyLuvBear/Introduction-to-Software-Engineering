// /**
//  * Wallet Service
//  *
//  * Handles all wallet-related API calls
//  */

// import { get, post, put, del } from './api.js'

// /**
//  * List all wallets
//  *
//  * @param {Object} params - Query parameters
//  * @param {string} params.status - Filter by status (active, archived)
//  * @returns {Promise<Object>} List of wallets
//  */
// export async function listWallets({ status } = {}) {
//     const qs = status ? `?status=${encodeURIComponent(status)}` : ''
//     return get(`/wallets${qs}`)
// }

// /**
//  * Create a new wallet
//  *
//  * @param {Object} data - Wallet data
//  * @param {string} data.name - Wallet name
//  * @param {string} data.type - Wallet type (personal, shared)
//  * @param {number} data.initialBalance - Initial balance
//  * @param {string} data.currency - Currency code (VND, USD, etc.)
//  * @param {string} data.description - Wallet description
//  * @returns {Promise<Object>} Created wallet
//  */
// export async function createWallet({ name, type, initialBalance, currency, description }) {
//     return post('/wallets', { name, type, initialBalance, currency, description })
// }

// /**
//  * Update a wallet
//  *
//  * @param {string} id - Wallet ID
//  * @param {Object} data - Update data
//  * @returns {Promise<Object>} Updated wallet
//  */
// export async function updateWallet(id, { name, type, currency, description, status } = {}) {
//     return put(`/wallets/${encodeURIComponent(id)}`, { name, type, currency, description, status })
// }

// /**
//  * Delete a wallet
//  *
//  * @param {string} id - Wallet ID
//  * @returns {Promise<Object>} Response
//  */
// export async function deleteWallet(id) {
//     return del(`/wallets/${encodeURIComponent(id)}`)
// }

// export default {
//     listWallets,
//     createWallet,
//     updateWallet,
//     deleteWallet,
// }
