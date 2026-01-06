import express from 'express'
import authenticate from '../middleware/auth.js'
import {
  createWallet,
  getUserWallets,
  getWallet,
  updateWallet,
  deleteWallet,
  updateWalletBalance,
  checkWalletName,
  getWalletStats,
  inviteMember,
  leaveWallet,
  transferOwnership,
  removeMemberFromWallet,
  setMemberPermission,
  getWalletMembers
} from '../controllers/walletsController.js'

const router = express.Router()

// All wallet routes require auth
router.use(authenticate)

/**
 * Wallets Routes - API endpoints for Wallet Management Use Cases
 *
 * Use Cases Covered:
 * U010 - Create Wallet
 * U011 - Invite Member to Wallet
 * U012 - Leave Shared Wallet
 * U013 - Remove Member
 * U014 - Set Member Permission
 *
 * All routes require authentication middleware (req.user.id)
 * Routes follow RESTful conventions
 */

// @route   POST /api/wallets
// @desc    Create new wallet (Use Case U010 Main Scenario)
// @access  Private
// @body    { name, type, initialBalance?, currency?, description? }
router.post('/', createWallet)

// @route   GET /api/wallets
// @desc    Get user's wallets with optional status filter
// @access  Private
// @query   ?status=active|inactive (default: active)
router.get('/', getUserWallets)

// @route   GET /api/wallets/stats
// @desc    Get wallet statistics (totals, type distribution)
// @access  Private
router.get('/stats', getWalletStats)

// @route   POST /api/wallets/check-name
// @desc    Check if wallet name is available (real-time validation)
// @access  Private
// @body    { name }
router.post('/check-name', checkWalletName)

// @route   GET /api/wallets/:id
// @desc    Get specific wallet by ID
// @access  Private
router.get('/:id', getWallet)

// @route   PUT /api/wallets/:id
// @desc    Update wallet information
// @access  Private
// @body    { name?, type?, currency?, description?, status? }
router.put('/:id', updateWallet)

// @route   DELETE /api/wallets/:id
// @desc    Delete wallet (soft delete - set status to inactive)
// @access  Private
router.delete('/:id', deleteWallet)

// @route   POST /api/wallets/:id/balance
// @desc    Update wallet balance (for transaction processing)
// @access  Private
// @body    { amount, operation: 'add'|'subtract' }
router.post('/:id/balance', updateWalletBalance)

// ========== SHARED WALLET MANAGEMENT ROUTES ==========

// @route   POST /api/wallets/:id/invite
// @desc    Invite member to shared wallet (Use Case U011)
// @access  Private (Owner only)
// @body    { email, message? }
router.post('/:id/invite', inviteMember)

// @route   GET /api/wallets/:id/members
// @desc    Get wallet members list
// @access  Private (Members only)
router.get('/:id/members', getWalletMembers)

// @route   POST /api/wallets/:id/leave
// @desc    Leave shared wallet (Use Case U012)
// @access  Private
router.post('/:id/leave', leaveWallet)

// @route   POST /api/wallets/:id/transfer-ownership
// @desc    Transfer wallet ownership (Use Case U012 - Alternative)
// @access  Private (Owner only)
// @body    { newOwnerId }
router.post('/:id/transfer-ownership', transferOwnership)

// @route   DELETE /api/wallets/:id/members/:memberId
// @desc    Remove member from wallet (Use Case U013)
// @access  Private (Owner only)
router.delete('/:id/members/:memberId', removeMemberFromWallet)

// @route   PUT /api/wallets/:id/members/:memberId/permission
// @desc    Set member permission (Use Case U014)
// @access  Private (Owner only)
// @body    { permission: 'view'|'edit' }
router.put('/:id/members/:memberId/permission', setMemberPermission)

export default router