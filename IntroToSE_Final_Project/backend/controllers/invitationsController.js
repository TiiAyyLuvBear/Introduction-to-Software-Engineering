import mongoose from 'mongoose'
import Invitation from '../models/Invitation.js'
import Wallet from '../models/Wallet.js'
import User from '../models/User.js'

function asObjectId(value) {
  return new mongoose.Types.ObjectId(value)
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function isOwner(wallet, userId) {
  if (!wallet || !userId) return false
  const uid = userId.toString()
  if (wallet.ownerId?.toString() === uid) return true
  if (wallet.userId?.toString() === uid) return true
  return false
}

/**
 * M2-06 Send Invite API
 * POST /api/invitations/invite
 * Body: { walletId, email, message? }
 */
export const sendInvite = async (req, res) => {
  try {
    const inviterId = req.user?.id
    if (!inviterId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const walletId = req.body.walletId
    const email = normalizeEmail(req.body.email)
    const message = req.body.message

    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ success: false, error: 'Invalid walletId' })
    }
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' })
    }

    const wallet = await Wallet.findOne({ _id: walletId, status: 'active' })
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' })

    if (!isOwner(wallet, inviterId)) {
      return res.status(403).json({ success: false, error: 'Only wallet owner can invite members' })
    }

    const invitee = await User.findOne({ email })
    if (!invitee) {
      return res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' })
    }

    // Already a member?
    const alreadyMember = Array.isArray(wallet.members) && wallet.members.some(m => m.userId?.toString() === invitee._id.toString())
    if (alreadyMember) {
      return res.status(409).json({ success: false, error: 'User already a member', code: 'ALREADY_MEMBER' })
    }

    const existingInvitation = await Invitation.findOne({
      walletId,
      inviteeEmail: email,
      status: 'pending',
    })

    if (existingInvitation) {
      return res.status(409).json({ success: false, error: 'User already invited', code: 'ALREADY_INVITED' })
    }

    const invitation = new Invitation({
      walletId,
      inviterId,
      inviteeEmail: email,
      inviteeId: invitee._id,
      message: message?.trim(),
      status: 'pending',
    })
    invitation.generateToken()
    await invitation.save()

    // “Fake notification”: return token so frontend can simulate email link.
    res.status(201).json({
      success: true,
      data: {
        invitation: {
          id: invitation._id,
          walletId: invitation.walletId,
          inviteeEmail: invitation.inviteeEmail,
          inviteeName: invitee.name,
          status: invitation.status,
          invitedAt: invitation.invitedAt,
          expiresAt: invitation.expiresAt,
          token: invitation.invitationToken,
        },
      },
      message: 'Invitation sent successfully',
    })
  } catch (error) {
    console.error('Send invite error:', error)
    res.status(500).json({ success: false, error: 'Failed to send invitation', message: error.message })
  }
}

/**
 * M2-07 Accept Invite API
 * POST /api/invitations/accept
 * Body: { token }
 */
export const acceptInvite = async (req, res) => {
  try {
    const userId = req.user?.id
    const userEmail = normalizeEmail(req.user?.email)
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const token = String(req.body.token || '').trim()
    if (!token) return res.status(400).json({ success: false, error: 'token is required' })

    const invitation = await Invitation.findOne({ invitationToken: token }).populate('walletId', 'name type ownerId userId isShared members status')
    if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' })

    // Expire if needed
    if (invitation.isExpired) {
      invitation.status = 'expired'
      await invitation.save()
      return res.status(400).json({ success: false, error: 'Invitation has expired' })
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Invitation is no longer pending' })
    }

    if (invitation.inviteeEmail !== userEmail) {
      return res.status(403).json({ success: false, error: 'This invitation does not belong to the current user' })
    }

    // Accept invitation record first
    await invitation.accept(userId)

    const wallet = await Wallet.findById(invitation.walletId._id)
    if (!wallet || wallet.status !== 'active') {
      return res.status(404).json({ success: false, error: 'Wallet not found' })
    }

    // Ensure wallet is marked shared and has an owner
    wallet.isShared = true
    if (!wallet.ownerId) wallet.ownerId = asObjectId(invitation.inviterId)

    // Ensure owner is in members with edit permission
    const ownerId = wallet.ownerId?.toString()
    if (ownerId) {
      const ownerMember = wallet.members?.find(m => m.userId?.toString() === ownerId)
      if (!ownerMember) {
        wallet.members.push({ userId: wallet.ownerId, permission: 'edit', joinedAt: new Date() })
      } else if (ownerMember.permission !== 'edit') {
        ownerMember.permission = 'edit'
      }
    }

    // Add invitee as member if missing
    const uid = userId.toString()
    const existing = wallet.members?.find(m => m.userId?.toString() === uid)
    if (!existing) {
      wallet.members.push({ userId: asObjectId(userId), permission: 'view', joinedAt: new Date() })
    }

    await wallet.save()

    res.json({
      success: true,
      data: {
        walletId: wallet._id,
        walletName: wallet.name,
        permission: 'view',
        memberCount: wallet.members?.length || 0,
      },
      message: 'Invitation accepted successfully',
    })
  } catch (error) {
    console.error('Accept invite error:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to accept invitation' })
  }
}
