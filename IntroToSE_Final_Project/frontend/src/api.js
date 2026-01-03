

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Correct port 4000
  timeout: 10000,
})

// Request interceptor - Attach User ID (Simulated Auth)
api.interceptors.request.use(
  async (config) => {
    try {
      const userStr = localStorage.getItem('currentUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        let userId = user.id

        // AUTO-FIX: Replace invalid demo ID with valid ObjectId if found
        if (userId === 'demo-user-1') {
          userId = '6957fd0d4b2aa1c3fe4390e3';
          console.warn('Corrected invalid userId "demo-user-1" to valid ObjectId in request');
        }

        // Inject userId into params for GET/DELETE
        if (config.method === 'get' || config.method === 'delete') {
          config.params = { ...config.params, userId }
        }

        // Inject userId into body for POST/PUT
        if (config.method === 'post' || config.method === 'put') {
          config.data = { ...config.data, userId }
        }
      }
    } catch (error) {
      console.error('Error attaching user ID:', error)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Wallet API functions
export const walletAPI = {
  createWallet: async (walletData) => {
    const response = await api.post('/wallets', walletData)
    return response.data
  },
  getUserWallets: async (status = 'active') => {
    const response = await api.get(`/wallets?status=${status}`)
    // Backend returns array directly or { wallets: [] }? 
    // Usually getAll controllers return []. Let's handle both.
    return response.data
  },
  getWallet: async (walletId) => {
    const response = await api.get(`/wallets/${walletId}`)
    return response.data
  },
  updateWallet: async (walletId, updateData) => {
    const response = await api.put(`/wallets/${walletId}`, updateData)
    return response.data
  },
  deleteWallet: async (walletId) => {
    const response = await api.delete(`/wallets/${walletId}`)
    return response.data
  },
}

export const invitationAPI = {
  getPending: async () => {
    const response = await api.get('/invitations/pending')
    return response.data
  },
  respond: async (invitationId, response) => {
    const apiResponse = await api.post(`/invitations/${invitationId}/respond`, {
      response
    })
    return apiResponse.data
  }
}

export const authAPI = {
  // Placeholder since we use simulated login for now
  verifyToken: async (idToken) => { return { success: true } },
  getCurrentUser: async () => { return { success: true } },
  updateProfile: async (profileData) => { return { success: true } },
  deleteAccount: async () => { return { success: true } }
}

export const transactionAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/transactions?${params}`)
    return response.data
  },
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData)
    return response.data
  },
  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  },
  transfer: async (transferData) => {
    const response = await api.post('/transactions/transfer', transferData)
    return response.data
  }
}

export const categoryAPI = {
  getAll: async (type) => {
    const response = await api.get(`/categories${type ? `?type=${type}` : ''}`)
    return response.data
  },
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData)
    return response.data
  },
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}

export const budgetAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/budgets?${params}`)
    return response.data
  },
  create: async (budgetData) => {
    const response = await api.post('/budgets', budgetData)
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/budgets/${id}`)
    return response.data
  },
  update: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  },
  getProgress: async (id) => {
    const response = await api.get(`/budgets/${id}/progress`)
    return response.data
  }
}

export const savingGoalAPI = {
  getAll: async (filters = {}) => {
    // CORRECTED PATH: /saving-goals
    const params = new URLSearchParams(filters)
    const response = await api.get(`/saving-goals?${params}`)
    return response.data
  },
  create: async (goalData) => {
    const response = await api.post('/saving-goals', goalData)
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/saving-goals/${id}`)
    return response.data
  },
  update: async (id, goalData) => {
    const response = await api.put(`/saving-goals/${id}`, goalData)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/saving-goals/${id}`)
    return response.data
  },
  addContribution: async (id, contributionData) => {
    const response = await api.post(`/saving-goals/${id}/contributions`, contributionData) // Corrected path
    return response.data
  },
  removeContribution: async (id, contributionId) => {
    const response = await api.delete(`/saving-goals/${id}/contributions/${contributionId}`) // Corrected path
    return response.data
  }
}

export const reportAPI = {
  getSummary: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await api.get(`/reports/summary?${params}`)
    return response.data
  },
  getByCategory: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await api.get(`/reports/by-category?${params}`)
    return response.data
  },
  getByWallet: async () => {
    const response = await api.get('/reports/by-wallet')
    return response.data
  },
  getTrends: async (period = 'monthly') => {
    const response = await api.get(`/reports/trends?period=${period}`)
    return response.data
  }
}

export default api
