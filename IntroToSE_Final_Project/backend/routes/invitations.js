import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  respondToInvitation,
  getPendingInvitations
} from '../controllers/walletsController.js'
import { sendInvite, acceptInvite } from '../controllers/invitationsController.js'

const router = express.Router()

/**
 * Invitations Routes - API endpoints for Use Case U011: Invite Member to Wallet
 * 
 * All routes require authentication middleware (req.user.id)
 */

// All invitation routes require auth
router.use(authenticate)

// @route   POST /api/invitations/invite
// @desc    Send wallet invitation (M2-06)
// @access  Private (Owner only)
// @body    { walletId, email, message? }
router.post('/invite', sendInvite)

// @route   POST /api/invitations/accept
// @desc    Accept invitation by token (M2-07)
// @access  Private (Invitee only)
// @body    { token }
router.post('/accept', acceptInvite)

// @route   GET /api/invitations/pending
// @desc    Get pending invitations for current user
// @access  Private
router.get('/pending', getPendingInvitations)

// @route   POST /api/invitations/:invitationId/respond
// @desc    Accept or decline wallet invitation (Use Case U011 - Response Phase)
// @access  Private (Invitee only)
// @body    { response: 'accept'|'decline' }
router.post('/:invitationId/respond', respondToInvitation)

export default router