import axios from 'axios'
// import { getAuth } from 'firebase/auth'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
})

// TEMPORARILY COMMENTED OUT - Backend integration
/*
// Request interceptor - Attach Firebase token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const auth = getAuth()
        const user = auth.currentUser
        
        if (user) {
          await user.getIdToken(true) // Force refresh
          // Retry the original request
          const config = error.config
          const token = await user.getIdToken()
          config.headers.Authorization = `Bearer ${token}`
          return api.request(config)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Redirect to login or show error
      }
    }
    
    return Promise.reject(error)
  }
)
*/

// TEMPORARILY COMMENTED OUT - Backend integration
/*
// Wallet API functions for Use Case U010: Create Wallet
export const walletAPI = {
  // Create new wallet (Use Case U010 Main Scenario)
  createWallet: async (walletData) => {
    const response = await api.post('/wallets', walletData)
    return response.data
  },

  // Get user's wallets
  getUserWallets: async (status = 'active') => {
    const response = await api.get(`/wallets?status=${status}`)
    return response.data
  },

  // Get specific wallet
  getWallet: async (walletId) => {
    const response = await api.get(`/wallets/${walletId}`)
    return response.data
  },

  // Update wallet
  updateWallet: async (walletId, updateData) => {
    const response = await api.put(`/wallets/${walletId}`, updateData)
    return response.data
  },

  // Delete wallet (soft delete)
  deleteWallet: async (walletId) => {
    const response = await api.delete(`/wallets/${walletId}`)
    return response.data
  },

  // Update wallet balance
  updateWalletBalance: async (walletId, amount, operation = 'add') => {
    const response = await api.post(`/wallets/${walletId}/balance`, {
      amount,
      operation
    })
    return response.data
  },

  // Check wallet name availability (for real-time validation)
  checkWalletName: async (name) => {
    const response = await api.post('/wallets/check-name', { name })
    return response.data
  },

  // Get wallet statistics
  getWalletStats: async () => {
    const response = await api.get('/wallets/stats')
    return response.data
  },

  // ========== SHARED WALLET MANAGEMENT ==========
  
  // Invite member to wallet (Use Case U011)
  inviteMember: async (walletId, email, message = '') => {
    const response = await api.post(`/wallets/${walletId}/invite`, {
      email,
      message
    })
    return response.data
  },

  // Get wallet members
  getWalletMembers: async (walletId) => {
    const response = await api.get(`/wallets/${walletId}/members`)
    return response.data
  },

  // Leave shared wallet (Use Case U012)
  leaveWallet: async (walletId) => {
    const response = await api.post(`/wallets/${walletId}/leave`)
    return response.data
  },

  // Transfer ownership (Use Case U012 - Alternative)
  transferOwnership: async (walletId, newOwnerId) => {
    const response = await api.post(`/wallets/${walletId}/transfer-ownership`, {
      newOwnerId
    })
    return response.data
  },

  // Remove member (Use Case U013)
  removeMember: async (walletId, memberId) => {
    const response = await api.delete(`/wallets/${walletId}/members/${memberId}`)
    return response.data
  },

  // Set member permission (Use Case U014)
  setMemberPermission: async (walletId, memberId, permission) => {
    const response = await api.put(`/wallets/${walletId}/members/${memberId}/permission`, {
      permission
    })
    return response.data
  }
}
*/

// TEMPORARILY COMMENTED OUT - Backend integration
/*
// Invitation API functions for Use Case U011
export const invitationAPI = {
  // Get pending invitations for current user
  getPending: async () => {
    const response = await api.get('/invitations/pending')
    return response.data
  },

  // Respond to invitation (accept/decline)
  respond: async (invitationId, response) => {
    const apiResponse = await api.post(`/invitations/${invitationId}/respond`, {
      response
    })
    return apiResponse.data
  }
}
*/

// TEMPORARILY COMMENTED OUT - Backend integration
/*
// Authentication API functions
export const authAPI = {
  // Verify Firebase token and sync with backend
  verifyToken: async (idToken) => {
    const response = await api.post('/auth/verify', { idToken })
    return response.data
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/auth/account')
    return response.data
  }
}

// Transactions API
export const transactionAPI = {
  // Get all transactions
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/transactions?${params}`)
    return response.data
  },

  // Create transaction
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData)
    return response.data
  },

  // Update transaction
  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return response.data
  },

  // Delete transaction
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  },

  // Transfer between wallets
  transfer: async (transferData) => {
    const response = await api.post('/transactions/transfer', transferData)
    return response.data
  }
}

// Categories API
export const categoryAPI = {
  // Get all categories
  getAll: async (type) => {
    const response = await api.get(`/categories${type ? `?type=${type}` : ''}`)
    return response.data
  },

  // Create category
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData)
    return response.data
  },

  // Update category
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data
  },

  // Delete category
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}

// Budgets API
export const budgetAPI = {
  // Get all budgets
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/budgets?${params}`)
    return response.data
  },

  // Create budget
  create: async (budgetData) => {
    const response = await api.post('/budgets', budgetData)
    return response.data
  },

  // Get budget by ID
  getById: async (id) => {
    const response = await api.get(`/budgets/${id}`)
    return response.data
  },

  // Update budget
  update: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData)
    return response.data
  },

  // Delete budget
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  },

  // Get budget progress
  getProgress: async (id) => {
    const response = await api.get(`/budgets/${id}/progress`)
    return response.data
  }
}

// Saving Goals API
export const savingGoalAPI = {
  // Get all saving goals
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/savings?${params}`)
    return response.data
  },

  // Create saving goal
  create: async (goalData) => {
    const response = await api.post('/savings', goalData)
    return response.data
  },

  // Get saving goal by ID
  getById: async (id) => {
    const response = await api.get(`/savings/${id}`)
    return response.data
  },

  // Update saving goal
  update: async (id, goalData) => {
    const response = await api.put(`/savings/${id}`, goalData)
    return response.data
  },

  // Delete saving goal
  delete: async (id) => {
    const response = await api.delete(`/savings/${id}`)
    return response.data
  },

  // Add contribution
  addContribution: async (id, contributionData) => {
    const response = await api.post(`/savings/${id}/contribute`, contributionData)
    return response.data
  },

  // Remove contribution
  removeContribution: async (id, contributionId) => {
    const response = await api.delete(`/savings/${id}/contributions/${contributionId}`)
    return response.data
  }
}

// Reports API
export const reportAPI = {
  // Get financial summary
  getSummary: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await api.get(`/reports/summary?${params}`)
    return response.data
  },

  // Get report by category
  getByCategory: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await api.get(`/reports/by-category?${params}`)
    return response.data
  },

  // Get report by wallet
  getByWallet: async () => {
    const response = await api.get('/reports/by-wallet')
    return response.data
  },

  // Get spending trends
  getTrends: async (period = 'monthly') => {
    const response = await api.get(`/reports/trends?period=${period}`)
    return response.data
  }
}
*/

// Temporary mock API for development (remove when backend is ready)
export const walletAPI = {}
export const invitationAPI = {}
export const authAPI = {}
export const transactionAPI = {}
export const categoryAPI = {}
export const budgetAPI = {}
export const savingGoalAPI = {}
export const reportAPI = {}

export default api
