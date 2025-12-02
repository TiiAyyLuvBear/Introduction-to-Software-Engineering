import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 5000,
})

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

export default api
