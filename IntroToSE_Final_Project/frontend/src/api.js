/**
 * ============================================================================
 * API SERVICE - FRONTEND DEMO VERSION
 * ============================================================================
 * 
 * NOTE: Tất cả API calls đã được COMMENT để demo không cần backend
 * Sử dụng mockData.js thay thế
 * 
 * Để kích hoạt lại API calls, uncommment các dòng code và thêm:
 * import axios from 'axios'
 * ============================================================================
 */

// COMMENTED FOR DEMO - Uncomment khi có backend
/*
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 5000,
})
*/

// Wallet API functions for Use Case U010: Create Wallet
export const walletAPI = {
  // Create new wallet (Use Case U010 Main Scenario)
  createWallet: async (walletData) => {
    // DEMO: Comment API call - Use mockData in component
    // const response = await api.post('/wallets', walletData)
    // return response.data
    
    console.log('💬 [API] Create Wallet (DEMO MODE):', walletData)
    throw new Error('API not connected - Use mockData')
  },

  // Get user's wallets
  getUserWallets: async (status = 'active') => {
    // DEMO: Comment API call
    // const response = await api.get(`/wallets?status=${status}`)
    // return response.data
    
    console.log('💬 [API] Get User Wallets (DEMO MODE):', status)
    throw new Error('API not connected - Use mockData')
  },

  // Get specific wallet
  getWallet: async (walletId) => {
    // DEMO: Comment API call
    // const response = await api.get(`/wallets/${walletId}`)
    // return response.data
    
    console.log('💬 [API] Get Wallet (DEMO MODE):', walletId)
    throw new Error('API not connected - Use mockData')
  },

  // Update wallet
  updateWallet: async (walletId, updateData) => {
    // DEMO: Comment API call
    // const response = await api.put(`/wallets/${walletId}`, updateData)
    // return response.data
    
    console.log('💬 [API] Update Wallet (DEMO MODE):', walletId, updateData)
    throw new Error('API not connected - Use mockData')
  },

  // Delete wallet (soft delete)
  deleteWallet: async (walletId) => {
    // DEMO: Comment API call
    // const response = await api.delete(`/wallets/${walletId}`)
    // return response.data
    
    console.log('💬 [API] Delete Wallet (DEMO MODE):', walletId)
    throw new Error('API not connected - Use mockData')
  },

  // Update wallet balance
  updateWalletBalance: async (walletId, amount, operation = 'add') => {
    // DEMO: Comment API call
    // const response = await api.post(`/wallets/${walletId}/balance`, {
    //   amount,
    //   operation
    // })
    // return response.data
    
    console.log('💬 [API] Update Wallet Balance (DEMO MODE):', walletId, amount, operation)
    throw new Error('API not connected - Use mockData')
  },

  // Check wallet name availability (for real-time validation)
  checkWalletName: async (name) => {
    // DEMO: Comment API call
    // const response = await api.post('/wallets/check-name', { name })
    // return response.data
    
    console.log('💬 [API] Check Wallet Name (DEMO MODE):', name)
    throw new Error('API not connected - Use mockData')
  },

  // Get wallet statistics
  getWalletStats: async () => {
    // DEMO: Comment API call
    // const response = await api.get('/wallets/stats')
    // return response.data
    
    console.log('💬 [API] Get Wallet Stats (DEMO MODE)')
    throw new Error('API not connected - Use mockData')
  },

  // ========== SHARED WALLET MANAGEMENT ==========
  
  // Invite member to wallet (Use Case U011)
  inviteMember: async (walletId, email, message = '') => {
    // DEMO: Comment API call
    // const response = await api.post(`/wallets/${walletId}/invite`, {
    //   email,
    //   message
    // })
    // return response.data
    
    console.log('💬 [API] Invite Member (DEMO MODE):', walletId, email, message)
    throw new Error('API not connected - Use mockData')
  },

  // Get wallet members
  getWalletMembers: async (walletId) => {
    // DEMO: Comment API call
    // const response = await api.get(`/wallets/${walletId}/members`)
    // return response.data
    
    console.log('💬 [API] Get Wallet Members (DEMO MODE):', walletId)
    throw new Error('API not connected - Use mockData')
  },

  // Leave shared wallet (Use Case U012)
  leaveWallet: async (walletId) => {
    // DEMO: Comment API call
    // const response = await api.post(`/wallets/${walletId}/leave`)
    // return response.data
    
    console.log('💬 [API] Leave Wallet (DEMO MODE):', walletId)
    throw new Error('API not connected - Use mockData')
  },

  // Transfer ownership (Use Case U012 - Alternative)
  transferOwnership: async (walletId, newOwnerId) => {
    // DEMO: Comment API call
    // const response = await api.post(`/wallets/${walletId}/transfer-ownership`, {
    //   newOwnerId
    // })
    // return response.data
    
    console.log('💬 [API] Transfer Ownership (DEMO MODE):', walletId, newOwnerId)
    throw new Error('API not connected - Use mockData')
  },

  // Remove member (Use Case U013)
  removeMember: async (walletId, memberId) => {
    // DEMO: Comment API call
    // const response = await api.delete(`/wallets/${walletId}/members/${memberId}`)
    // return response.data
    
    console.log('💬 [API] Remove Member (DEMO MODE):', walletId, memberId)
    throw new Error('API not connected - Use mockData')
  },

  // Set member permission (Use Case U014)
  setMemberPermission: async (walletId, memberId, permission) => {
    // DEMO: Comment API call
    // const response = await api.put(`/wallets/${walletId}/members/${memberId}/permission`, {
    //   permission
    // })
    // return response.data
    
    console.log('💬 [API] Set Member Permission (DEMO MODE):', walletId, memberId, permission)
    throw new Error('API not connected - Use mockData')
  }
}

// Invitation API functions for Use Case U011
export const invitationAPI = {
  // Get pending invitations for current user
  getPending: async () => {
    // DEMO: Comment API call
    // const response = await api.get('/invitations/pending')
    // return response.data
    
    console.log('💬 [API] Get Pending Invitations (DEMO MODE)')
    throw new Error('API not connected - Use mockData')
  },

  // Respond to invitation (accept/decline)
  respond: async (invitationId, response) => {
    // DEMO: Comment API call
    // const apiResponse = await api.post(`/invitations/${invitationId}/respond`, {
    //   response
    // })
    // return apiResponse.data
    
    console.log('💬 [API] Respond to Invitation (DEMO MODE):', invitationId, response)
    throw new Error('API not connected - Use mockData')
  }
}

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    // DEMO: Comment API call
    // const response = await api.post('/auth/register', userData)
    // return response.data
    
    console.log('💬 [API] Register (DEMO MODE):', userData)
    throw new Error('API not connected - Use mockData')
  },

  // Login user
  login: async (credentials) => {
    // DEMO: Comment API call
    // const response = await api.post('/auth/login', credentials)
    // return response.data
    
    console.log('💬 [API] Login (DEMO MODE):', credentials)
    throw new Error('API not connected - Use mockData')
  },

  // Logout user
  logout: async () => {
    // DEMO: Comment API call
    // const response = await api.post('/auth/logout')
    // return response.data
    
    console.log('💬 [API] Logout (DEMO MODE)')
    throw new Error('API not connected - Use mockData')
  },

  // Get current user profile
  getProfile: async () => {
    // DEMO: Comment API call
    // const response = await api.get('/auth/profile')
    // return response.data
    
    console.log('💬 [API] Get Profile (DEMO MODE)')
    throw new Error('API not connected - Use mockData')
  },

  // Refresh access token
  refreshToken: async () => {
    // DEMO: Comment API call
    // const response = await api.post('/auth/refresh')
    // return response.data
    
    console.log('💬 [API] Refresh Token (DEMO MODE)')
    throw new Error('API not connected - Use mockData')
  }
}

// Export empty default for compatibility
// Uncomment khi có backend:
// export default api
export default {}
