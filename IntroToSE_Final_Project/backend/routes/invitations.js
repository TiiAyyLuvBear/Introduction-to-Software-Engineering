import express from 'express'
import {
  respondToInvitation,
  getPendingInvitations
} from '../controllers/walletsController.js'

const router = express.Router()

/**
 * Invitations Routes - API endpoints for Use Case U011: Invite Member to Wallet
 * 
 * All routes require authentication middleware (req.user.id)
 */

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