// /**
//  * @deprecated This file is deprecated. Please use services from @/services instead.
//  *
//  * This file now re-exports from the new services layer for backward compatibility.
//  *
//  * Migration guide:
//  * OLD: import { api } from '@/lib/api'
//  * NEW: import { authService, walletService } from '@/services'
//  */

// // Re-export everything from services for backward compatibility
// export {
//   getApiBaseUrl,
//   getAccessToken,
//   getRefreshToken,
//   getStoredUser,
//   setSession,
//   clearSession,
//   request,
// } from '../services/api.js'

// import authService from '../services/authService.js'
// import walletService from '../services/walletService.js'
// import transactionService from '../services/transactionService.js'
// import categoryService from '../services/categoryService.js'
// import budgetService from '../services/budgetService.js'
// import goalService from '../services/goalService.js'
// import reportService from '../services/reportService.js'

// /**
//  * @deprecated Use individual services instead
//  *
//  * Example:
//  * import { authService } from '@/services'
//  * await authService.login({ email, password })
//  */
// export const api = {
//   // Auth
//   register: authService.register,
//   login: authService.login,
//   logout: authService.logout,
//   profile: authService.getProfile,
//   me: authService.getMe,

//   // Wallets
//   listWallets: walletService.listWallets,
//   createWallet: walletService.createWallet,
//   updateWallet: walletService.updateWallet,
//   deleteWallet: walletService.deleteWallet,

//   // Categories
//   listCategories: categoryService.listCategories,
//   createCategory: categoryService.createCategory,
//   updateCategory: categoryService.updateCategory,
//   deleteCategory: categoryService.deleteCategory,

//   // Transactions
//   listTransactions: transactionService.listTransactions,
//   createTransaction: transactionService.createTransaction,
//   deleteTransaction: transactionService.deleteTransaction,
//   transfer: transactionService.transfer,

//   // Budgets
//   listBudgets: budgetService.listBudgets,
//   createBudget: budgetService.createBudget,
//   deleteBudget: budgetService.deleteBudget,

//   // Goals
//   listGoals: goalService.listGoals,
//   getGoal: goalService.getGoal,
//   createGoal: goalService.createGoal,
//   contributeToGoal: goalService.contributeToGoal,

//   // Reports
//   reportSummary: reportService.getSummary,
//   reportByCategory: reportService.getByCategory,
//   reportByWallet: reportService.getByWallet,
//   reportBarChart: reportService.getBarChart,
// }
