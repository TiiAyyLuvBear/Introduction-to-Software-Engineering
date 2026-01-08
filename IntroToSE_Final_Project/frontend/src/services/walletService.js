/**
 * Wallet Service
 *
 * Handles all wallet-related API calls
 */

import api from './api.js'

// ==================== WALLET CRUD ====================

/**
 * List all wallets
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (active, inactive)
 * @returns {Promise<Object>} List of wallets
 */
export async function listWallets({ status } = {}) {
    const res = await api.get('/wallets', { params: { status } })
    return res?.data?.data?.wallets || res?.data?.wallets || []
}

/**
 * Create a new wallet
 * @param {Object} data - Wallet data
 * @returns {Promise<Object>} Created wallet
 */
export async function createWallet({ name, type, initialBalance, currency, isShared, description }) {
    const res = await api.post('/wallets', { name, type, initialBalance, currency, isShared, description })
    return res?.data?.data?.wallet || res?.data?.wallet || res?.data
}

/**
 * Get wallet details
 * @param {string} id - Wallet ID
 * @returns {Promise<Object>} Wallet details
 */
export async function getWallet(id) {
    const res = await api.get(`/wallets/${encodeURIComponent(id)}`)
    return res?.data?.data?.wallet || res?.data?.wallet || res?.data
}

/**
 * Update a wallet
 * @param {string} id - Wallet ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated wallet
 */
export async function updateWallet(id, { name, type, currency, description, status } = {}) {
    const res = await api.put(`/wallets/${encodeURIComponent(id)}`, { name, type, currency, description, status })
    return res?.data?.data?.wallet || res?.data?.wallet || res?.data
}

/**
 * Delete a wallet (soft delete)
 * @param {string} id - Wallet ID
 * @returns {Promise<Object>} Response
 */
export async function deleteWallet(id) {
    const res = await api.delete(`/wallets/${encodeURIComponent(id)}`)
    return res?.data
}

// ==================== WALLET MEMBERS ====================

/**
 * Get wallet members
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Members info
 */
export async function getWalletMembers(walletId) {
    const res = await api.get(`/wallets/${encodeURIComponent(walletId)}/members`)
    return res?.data?.data || res?.data || null
}

/**
 * Set member permission
 * @param {string} walletId - Wallet ID
 * @param {string} memberId - Member ID
 * @param {string} permission - Permission level (view, edit, admin)
 * @returns {Promise<Object>} Response
 */
export async function setMemberPermission(walletId, memberId, permission) {
    const res = await api.put(
        `/wallets/${encodeURIComponent(walletId)}/members/${encodeURIComponent(memberId)}/permission`,
        { permission }
    )
    return res?.data
}

/**
 * Remove member from wallet
 * @param {string} walletId - Wallet ID
 * @param {string} memberId - Member ID
 * @returns {Promise<Object>} Response
 */
export async function removeMember(walletId, memberId) {
    const res = await api.delete(
        `/wallets/${encodeURIComponent(walletId)}/members/${encodeURIComponent(memberId)}`
    )
    return res?.data
}

// ==================== WALLET OWNERSHIP ====================

/**
 * Transfer wallet ownership
 * @param {string} walletId - Wallet ID
 * @param {string} newOwnerId - New owner's user ID
 * @returns {Promise<Object>} Response
 */
export async function transferOwnership(walletId, newOwnerId) {
    const res = await api.post(`/wallets/${encodeURIComponent(walletId)}/transfer-ownership`, { newOwnerId })
    return res?.data
}

/**
 * Leave wallet
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Response
 */
export async function leaveWallet(walletId) {
    const res = await api.post(`/wallets/${encodeURIComponent(walletId)}/leave`)
    return res?.data
}

// ==================== WALLET BALANCE ====================

/**
 * Recalculate wallet balance
 * @param {string} walletId - Optional wallet ID to recalculate specific wallet
 * @returns {Promise<Object>} Response
 */
export async function recalculateBalance(walletId = null) {
    const res = await api.post('/balance/recalculate', walletId ? { walletId } : {})
    return res?.data
}

// ==================== WALLET INVITATIONS ====================

/**
 * Send invitation to join wallet
 * @param {string} walletId - Wallet ID
 * @param {string} email - Invitee's email
 * @returns {Promise<Object>} Response
 */
export async function sendInvitation(walletId, email) {
    const res = await api.post(`/wallets/${encodeURIComponent(walletId)}/invite`, { email })
    return res?.data
}

/**
 * Get pending invitations for current user
 * @returns {Promise<Array>} List of pending invitations
 */
export async function getPendingInvitations() {
    const res = await api.get('/invitations/pending')
    return res?.data?.data?.invitations || res?.data?.invitations || []
}

/**
 * Respond to invitation
 * @param {string} invitationId - Invitation ID
 * @param {string} response - Response ('accept' or 'decline')
 * @returns {Promise<Object>} Response
 */
export async function respondToInvitation(invitationId, response) {
    const res = await api.post(`/invitations/${encodeURIComponent(invitationId)}/respond`, { response })
    return res?.data
}

/**
 * Cancel pending invitation
 * @param {string} walletId - Wallet ID
 * @param {string} invitationId - Invitation ID
 * @returns {Promise<Object>} Response
 */
export async function cancelInvitation(walletId, invitationId) {
    const res = await api.delete(
        `/wallets/${encodeURIComponent(walletId)}/invitations/${encodeURIComponent(invitationId)}`
    )
    return res?.data
}

export default {
    // CRUD
    listWallets,
    createWallet,
    getWallet,
    updateWallet,
    deleteWallet,
    // Balance
    recalculateBalance,
    // Members
    getWalletMembers,
    setMemberPermission,
    removeMember,
    // Ownership
    transferOwnership,
    leaveWallet,
    // Invitations
    sendInvitation,
    getPendingInvitations,
    respondToInvitation,
    cancelInvitation,
}
