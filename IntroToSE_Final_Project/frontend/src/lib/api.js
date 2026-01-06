// /**
//  * API wrapper - provides a unified interface for all API calls
//  * This wraps the individual service modules for easier imports
//  */

// import { request } from '../services/api.js'

// // Wallet API
// export const api = {
//     // Wallets
//     listWallets: async (params = {}) => {
//         return request('GET', '/api/wallets', null, params)
//     },

//     createWallet: async (data) => {
//         return request('POST', '/api/wallets', data)
//     },

//     updateWallet: async (id, data) => {
//         return request('PUT', `/api/wallets/${id}`, data)
//     },

//     deleteWallet: async (id) => {
//         return request('DELETE', `/api/wallets/${id}`)
//     },

//     getWalletMembers: async (walletId) => {
//         return request('GET', `/api/wallets/${walletId}/members`)
//     },

//     inviteWalletMember: async (walletId, data) => {
//         return request('POST', `/api/wallets/${walletId}/invite`, data)
//     },

//     setWalletMemberPermission: async (walletId, memberId, data) => {
//         return request('PUT', `/api/wallets/${walletId}/members/${memberId}/permission`, data)
//     },

//     removeWalletMember: async (walletId, memberId) => {
//         return request('DELETE', `/api/wallets/${walletId}/members/${memberId}`)
//     },

//     transferWalletOwnership: async (walletId, data) => {
//         return request('POST', `/api/wallets/${walletId}/transfer-ownership`, data)
//     },

//     leaveWallet: async (walletId) => {
//         return request('POST', `/api/wallets/${walletId}/leave`)
//     },

//     // Invitations
//     listPendingInvitations: async () => {
//         return request('GET', '/api/invitations/pending')
//     },

//     respondToInvitation: async (invitationId, data) => {
//         return request('POST', `/api/invitations/${invitationId}/respond`, data)
//     },

//     // Transactions
//     listTransactions: async (params = {}) => {
//         return request('GET', '/api/transactions', null, params)
//     },

//     createTransaction: async (data) => {
//         return request('POST', '/api/transactions', data)
//     },

//     updateTransaction: async (id, data) => {
//         return request('PUT', `/api/transactions/${id}`, data)
//     },

//     deleteTransaction: async (id) => {
//         return request('DELETE', `/api/transactions/${id}`)
//     },

//     // Categories
//     listCategories: async (params = {}) => {
//         return request('GET', '/api/categories', null, params)
//     },

//     createCategory: async (data) => {
//         return request('POST', '/api/categories', data)
//     },

//     updateCategory: async (id, data) => {
//         return request('PUT', `/api/categories/${id}`, data)
//     },

//     deleteCategory: async (id) => {
//         return request('DELETE', `/api/categories/${id}`)
//     },

//     // Budgets
//     listBudgets: async (params = {}) => {
//         return request('GET', '/api/budgets', null, params)
//     },

//     createBudget: async (data) => {
//         return request('POST', '/api/budgets', data)
//     },

//     updateBudget: async (id, data) => {
//         return request('PUT', `/api/budgets/${id}`, data)
//     },

//     deleteBudget: async (id) => {
//         return request('DELETE', `/api/budgets/${id}`)
//     },

//     // Goals/Savings
//     listGoals: async (params = {}) => {
//         return request('GET', '/api/goals', null, params)
//     },

//     getGoal: async (id) => {
//         return request('GET', `/api/goals/${id}`)
//     },

//     createGoal: async (data) => {
//         return request('POST', '/api/goals', data)
//     },

//     updateGoal: async (id, data) => {
//         return request('PUT', `/api/goals/${id}`, data)
//     },

//     deleteGoal: async (id) => {
//         return request('DELETE', `/api/goals/${id}`)
//     },

//     contributeToGoal: async (id, data) => {
//         return request('POST', `/api/goals/${id}/contribute`, data)
//     },

//     // Reports
//     reportSummary: async (params = {}) => {
//         return request('GET', '/api/reports/summary', null, params)
//     },

//     reportByCategory: async (params = {}) => {
//         return request('GET', '/api/reports/by-category', null, params)
//     },

//     reportByWallet: async (params = {}) => {
//         return request('GET', '/api/reports/by-wallet', null, params)
//     },
// }

// export default api
