import express from 'express'
import Invitation from '../models/Invitation.js'

const router = express.Router()

// @route   GET /api/invitations/by-token/:token
// @desc    Get invitation info by token (public, no auth)
router.get('/by-token/:token', async (req, res) => {
  try {
    const { token } = req.params
    if (!token) return res.status(400).json({ success: false, error: 'Missing token' })
    const invitation = await Invitation.findOne({ invitationToken: token })
    if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' })
    res.json({ success: true, data: { invitation } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
