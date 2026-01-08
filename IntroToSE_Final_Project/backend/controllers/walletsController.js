import Wallet from '../models/Wallet.js'
import Invitation from '../models/Invitation.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import mongoose from 'mongoose'
import { withMongoSession } from '../utils/mongoSession.js'

function canViewWallet(wallet, userId) {
  if (!wallet || !userId) return false
  const uid = userId.toString()
  if (wallet.userId?.toString() === uid) return true
  if (wallet.ownerId?.toString() === uid) return true
  if (Array.isArray(wallet.members) && wallet.members.some(m => m.userId?.toString() === uid)) return true
  return false
}

function isWalletOwner(wallet, userId) {
  if (!wallet || !userId) return false
  const uid = userId.toString()
  if (wallet.ownerId?.toString() === uid) return true
  if (wallet.userId?.toString() === uid) return true
  return false
}

/**
 * Wallets Controller - Handle Wallet Management Use Cases
 * 
 * Use Cases Covered:
 * U010 - Create Wallet
 * U011 - Invite Member to Wallet  
 * U012 - Leave Shared Wallet
 * U013 - Remove Member
 * U014 - Set Member Permission
 * 
 * Endpoints:
 * - POST /api/wallets - Create new wallet
 * - GET /api/wallets - Get user's wallets
 * - GET /api/wallets/:id - Get specific wallet
 * - PUT /api/wallets/:id - Update wallet
 * - DELETE /api/wallets/:id - Delete wallet
 * - POST /api/wallets/:id/balance - Update wallet balance
 * - POST /api/wallets/:id/invite - Invite member to shared wallet
 * - POST /api/wallets/:id/respond - Accept/decline invitation
 * - POST /api/wallets/:id/leave - Leave shared wallet
 * - DELETE /api/wallets/:id/members/:memberId - Remove member
 * - PUT /api/wallets/:id/members/:memberId/permission - Set member permission
 */

// @desc    Create new wallet (Use Case U010 Main Scenario)
// @route   POST /api/wallets
// @access  Private (requires authentication)
export const createWallet = async (req, res) => {
  try {
    const { name, type, initialBalance, currency, description } = req.body
    const userId = req.user?.id // From auth middleware

    // Step 7: System validates wallet information
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Wallet name is required',
        code: 'MISSING_WALLET_NAME'
      })
    }

    if (!type || !['Cash', 'Bank', 'Savings'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Valid wallet type is required (Cash, Bank, or Savings)',
        code: 'INVALID_WALLET_TYPE'
      })
    }

    // Performance tracking (requirement: < 1 second)
    const startTime = Date.now()

    try {
      // Step 8: System saves wallet to database
      const wallet = await Wallet.createWallet({
        name: name.trim(),
        type,
        initialBalance: parseFloat(initialBalance || 0),
        currentBalance: parseFloat(initialBalance || 0),
        currency: currency || 'USD',
        description: description?.trim(),
        userId
      })

      const endTime = Date.now()
      const processingTime = endTime - startTime

      // Step 9: Success response with performance info
      res.status(201).json({
        success: true,
        data: wallet,
        processingTime: `${processingTime}ms`,
        message: 'Wallet created successfully'
      })

      // Log performance for monitoring
      console.log(`Wallet created for user ${userId} in ${processingTime}ms`)

    } catch (error) {
      // Handle duplicate wallet name (Alternative Scenario 3a)
      if (error.code === 'DUPLICATE_WALLET_NAME') {
        return res.status(409).json({
          success: false,
          error: 'Wallet name already in use',
          code: 'DUPLICATE_WALLET_NAME'
        })
      }
      throw error
    }

  } catch (error) {
    console.error('Create wallet error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create wallet',
      message: error.message
    })
  }
}

// @desc    Get user's wallets
// @route   GET /api/wallets
// @access  Private
export const getUserWallets = async (req, res) => {
  try {
    const userId = req.user?.id
    const { status = 'active' } = req.query

    // const wallets = await Wallet.getUserWallets(userId, status)
    // Updated query to find wallets where user is OWNER or MEMBER (isShared logic)
    // Use Case U010/U011: User sees their own wallets and wallets they are invited to
    const wallets = await Wallet.find({
      $or: [
        { userId: userId },
        { 'members.userId': userId }
      ],
      status: status
    }).sort({ createdAt: -1 })

    // Transform data for display with myPermission
    const formattedWallets = wallets.map(wallet => {
      const info = wallet.getDisplayInfo()
      
      // Determine user's permission for this wallet
      let myPermission = 'view'
      const isOwner = wallet.ownerId?.toString() === userId?.toString() || 
                      wallet.userId?.toString() === userId?.toString()
      
      if (isOwner) {
        myPermission = 'owner'
      } else {
        const member = wallet.members?.find(m => m.userId?.toString() === userId?.toString())
        if (member) {
          myPermission = member.permission || 'view'
        }
      }
      
      return { ...info, myPermission }
    })
    // // Calculate total balance across all wallets
    // const totalBalance = wallets.reduce((sum, wallet) => {
    //   // In real app, implement currency conversion
    //   return sum + wallet.balance
    // Spec doesn't specify, but usually "My Assets" implies own wallets. 
    // For now, we sum all visible wallets or maybe just owned ones. 
    // Let's sum all visible for simplicity as per requirement "Lấy ví của tôi & ví được share")
    const totalBalance = formattedWallets.reduce((sum, wallet) => {
      return sum + (wallet.balance || 0)
    }, 0)

    res.json({
      success: true,
      data: {
        wallets: formattedWallets,
        totalBalance,
        walletCount: wallets.length
      }
    })

  } catch (error) {
    console.error('Get wallets error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallets',
      message: error.message
    })
  }
}

// @desc    Get specific wallet
// @route   GET /api/wallets/:id
// @access  Private
export const getWallet = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const wallet = await Wallet.findOne({
      _id: id,
      // Implement permissions: Owner OR Member can view
      $or: [
        { userId },
        { 'members.userId': userId }
      ],
      status: 'active'
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    res.json({
      success: true,
      data: wallet.getDisplayInfo()
    })

  } catch (error) {
    console.error('Get wallet error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet',
      message: error.message
    })
  }
}

// @desc    Update wallet
// @route   PUT /api/wallets/:id
// @access  Private
export const updateWallet = async (req, res) => {
  try {
    const { id } = req.params
    const { name, type, currency, description, status } = req.body
    const userId = req.user?.id

    const wallet = await Wallet.findOne({
      _id: id,
      userId
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    // Validate updates
    if (name && name.trim()) {
      wallet.name = name.trim()
    }

    if (type && ['Cash', 'Bank', 'Savings'].includes(type)) {
      wallet.type = type
    }

    if (currency && ['USD', 'VND', 'EUR', 'JPY'].includes(currency)) {
      wallet.currency = currency
    }

    if (description !== undefined) {
      wallet.description = description?.trim() || ''
    }

    if (status && ['active', 'inactive'].includes(status)) {
      wallet.status = status
    }

    await wallet.save()

    res.json({
      success: true,
      data: wallet.getDisplayInfo(),
      message: 'Wallet updated successfully'
    })

  } catch (error) {
    // Handle duplicate name error
    if (error.code === 'DUPLICATE_WALLET_NAME') {
      return res.status(409).json({
        success: false,
        error: 'Wallet name already in use',
        code: 'DUPLICATE_WALLET_NAME'
      })
    }

    console.error('Update wallet error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update wallet',
      message: error.message
    })
  }
}

// @desc    Delete wallet (soft delete)
// @route   DELETE /api/wallets/:id
// @access  Private
export const deleteWallet = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const wallet = await Wallet.findOne({
      _id: id,
      userId,
      status: 'active'
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    // Soft delete - set status to inactive
    wallet.status = 'inactive'
    await wallet.save()

    res.json({
      success: true,
      message: 'Wallet deleted successfully'
    })

  } catch (error) {
    console.error('Delete wallet error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete wallet',
      message: error.message
    })
  }
}

// @desc    Update wallet balance (for transactions)
// @route   POST /api/wallets/:id/balance
// @access  Private
export const updateWalletBalance = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, operation = 'add' } = req.body // operation: 'add' or 'subtract'
    const userId = req.user?.id

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      })
    }

    const wallet = await Wallet.findOne({
      _id: id,
      userId,
      status: 'active'
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    const balanceChange = operation === 'subtract' ? -parseFloat(amount) : parseFloat(amount)
    await wallet.updateBalance(balanceChange)

    res.json({
      success: true,
      data: {
        walletId: wallet._id,
        previousBalance: wallet.currentBalance - balanceChange,
        newBalance: wallet.currentBalance,
        balanceChange
      },
      message: 'Wallet balance updated successfully'
    })

  } catch (error) {
    console.error('Update balance error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update wallet balance',
      message: error.message
    })
  }
}

// @desc    Check wallet name availability
// @route   POST /api/wallets/check-name
// @access  Private
export const checkWalletName = async (req, res) => {
  try {
    const { name } = req.body
    const userId = req.user?.id

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Wallet name is required'
      })
    }

    const existingWallet = await Wallet.findOne({
      name: name.trim(),
      userId,
      status: 'active'
    })

    res.json({
      success: true,
      data: {
        available: !existingWallet,
        name: name.trim()
      }
    })

  } catch (error) {
    console.error('Check wallet name error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check wallet name',
      message: error.message
    })
  }
}

// @desc    Get wallet statistics
// @route   GET /api/wallets/stats
// @access  Private
export const getWalletStats = async (req, res) => {
  try {
    const userId = req.user?.id

    const stats = await Wallet.aggregate([
      { $match: { userId: userId, status: 'active' } },
      {
        $group: {
          _id: null,
          totalWallets: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' },
          walletsByType: {
            $push: {
              type: '$type',
              balance: '$currentBalance'
            }
          }
        }
      }
    ])

    const typeStats = stats[0]?.walletsByType?.reduce((acc, wallet) => {
      acc[wallet.type] = (acc[wallet.type] || 0) + 1
      return acc
    }, {}) || {}

    res.json({
      success: true,
      data: {
        totalWallets: stats[0]?.totalWallets || 0,
        totalBalance: stats[0]?.totalBalance || 0,
        typeDistribution: typeStats
      }
    })

  } catch (error) {
    console.error('Get wallet stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet statistics',
      message: error.message
    })
  }
}

// ========== SHARED WALLET MANAGEMENT ==========

// @desc    Invite member to shared wallet (Use Case U011)
// @route   POST /api/wallets/:id/invite
// @access  Private (Owner only)
export const inviteMember = async (req, res) => {
  try {
    const { id: walletId } = req.params
    const { email, message } = req.body
    const inviterId = req.user?.id

    // Performance tracking (requirement: < 1 second)
    const startTime = Date.now()

    // Step 4: System verifies that the user exists
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      })
    }

    // Find wallet and verify ownership
    const wallet = await Wallet.findOne({
      _id: walletId,
      status: 'active'
    }).populate('members.userId', 'name email')

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    // Check if user is owner (compare as strings since Firebase UID is string)
    const isOwner = wallet.ownerId?.toString() === inviterId?.toString() ||
                    wallet.userId?.toString() === inviterId?.toString()
    
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Only wallet owner can invite members'
      })
    }

    // Check if user exists
    const invitee = await User.findOne({ email: email.toLowerCase().trim() })
    if (!invitee) {
      return res.status(404).json({
        success: false,
        error: 'User not found. They must register first.',
        code: 'USER_NOT_FOUND'
      })
    }

    // Check if trying to invite self
    if (invitee._id.toString() === inviterId?.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot invite yourself',
        code: 'CANNOT_INVITE_SELF'
      })
    }

    // Check if user already a member
    const existingMember = wallet.members?.find(member => {
      const memberId = member.userId?._id?.toString() || member.userId?.toString()
      return memberId === invitee._id.toString()
    })
    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: 'User already a member',
        code: 'ALREADY_MEMBER'
      })
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      walletId,
      inviteeEmail: email.toLowerCase().trim(),
      status: 'pending'
    })

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        error: 'User already invited',
        code: 'ALREADY_INVITED'
      })
    }

    // Step 6: System creates invitation record
    const invitation = new Invitation({
      walletId,
      inviterId,
      inviteeEmail: email.toLowerCase().trim(),
      inviteeId: invitee._id,
      message: message?.trim(),
      status: 'pending'
    })

    invitation.generateToken()
    await invitation.save()

    // Auto-convert wallet to shared when first invitation is sent
    if (!wallet.isShared) {
      wallet.isShared = true
      // Ensure owner is in members list with edit permission
      const ownerInMembers = wallet.members?.find(m => 
        m.userId?.toString() === inviterId?.toString()
      )
      if (!ownerInMembers) {
        wallet.members.push({
          userId: inviterId,
          permission: 'edit',
          joinedAt: new Date()
        })
      }
      await wallet.save()
    }

    const endTime = Date.now()

    // Step 7: Send notification (would integrate with notification system)
    // TODO: Implement email/push notification service

    // Step 8: Confirm to owner that invitation was sent
    res.status(201).json({
      success: true,
      data: {
        invitation: {
          id: invitation._id,
          inviteeEmail: invitation.inviteeEmail,
          inviteeName: invitee.name,
          status: invitation.status,
          invitedAt: invitation.invitedAt,
          expiresAt: invitation.expiresAt
        }
      },
      processingTime: `${endTime - startTime}ms`,
      message: 'Invitation sent successfully'
    })

  } catch (error) {
    console.error('Invite member error:', error.message, error.stack)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invitation',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// @desc    Respond to wallet invitation (Use Case U011 - Response Phase)
// @route   POST /api/invitations/:invitationId/respond
// @access  Private (Invitee only)
export const respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params
    const { response } = req.body // 'accept' or 'decline'
    const userId = req.user?.id

    if (!['accept', 'decline'].includes(response)) {
      return res.status(400).json({
        success: false,
        error: 'Response must be accept or decline'
      })
    }

    const result = await withMongoSession(async (session) => {
      const invitation = await Invitation.findById(invitationId).session(session)
      if (!invitation) {
        const err = new Error('Invitation not found')
        err.status = 404
        throw err
      }

      // Verify invitee
      if (invitation.inviteeId?.toString() !== userId.toString()) {
        const err = new Error('Only invited user can respond to invitation')
        err.status = 403
        throw err
      }

      if (response === 'accept') {
        await invitation.accept(userId)

        const wallet = await Wallet.findById(invitation.walletId).session(session)
        if (!wallet || wallet.status !== 'active') {
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }

        // Ensure shared wallet invariants
        wallet.isShared = true
        if (!wallet.ownerId) wallet.ownerId = invitation.inviterId

        // Ensure owner is a member with edit permission
        const ownerId = wallet.ownerId?.toString()
        if (ownerId) {
          const ownerMember = wallet.members?.find((m) => m.userId?.toString() === ownerId)
          if (!ownerMember) {
            wallet.members.push({ userId: wallet.ownerId, permission: 'edit', joinedAt: new Date() })
          } else if (ownerMember.permission !== 'edit') {
            ownerMember.permission = 'edit'
          }
        }

        // Add invitee as member if missing
        const uid = userId.toString()
        const existing = wallet.members?.find((m) => m.userId?.toString() === uid)
        if (!existing) {
          wallet.members.push({ userId: userId, permission: 'view', joinedAt: new Date() })
        }

        await wallet.save({ session })

        return {
          accepted: true,
          walletId: wallet._id,
          walletName: wallet.name,
          permission: 'view',
          memberCount: wallet.members?.length || 0,
        }
      }

      await invitation.decline(userId)
      return { accepted: false }
    })

    if (!result.accepted) {
      return res.json({ success: true, message: 'Invitation declined' })
    }

    return res.json({
      success: true,
      data: {
        walletId: result.walletId,
        walletName: result.walletName,
        permission: result.permission,
        memberCount: result.memberCount,
      },
      message: 'Invitation accepted successfully',
    })

  } catch (error) {
    console.error('Respond to invitation error:', error)
    res.status(error.status || 500).json({
      success: false,
      error: error.status ? error.message : error.message || 'Failed to respond to invitation',
    })
  }
}

// @desc    Get pending invitations for user
// @route   GET /api/invitations/pending
// @access  Private
export const getPendingInvitations = async (req, res) => {
  try {
    const userEmail = req.user?.email

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'User email not found'
      })
    }

    const invitations = await Invitation.getPendingForUser(userEmail)

    res.json({
      success: true,
      data: {
        invitations: invitations.map(inv => ({
          id: inv._id,
          wallet: inv.walletId ? {
            id: inv.walletId._id,
            name: inv.walletId.name,
            type: inv.walletId.type
          } : null,
          inviter: inv.inviterInfo || {
            name: 'Unknown',
            email: inv.inviterId || 'Unknown'
          },
          message: inv.message,
          invitedAt: inv.invitedAt,
          expiresAt: inv.expiresAt
        }))
      }
    })

  } catch (error) {
    console.error('Get pending invitations error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get pending invitations',
      message: error.message
    })
  }
}

// @desc    Leave shared wallet (Use Case U012)
// @route   POST /api/wallets/:id/leave
// @access  Private
export const leaveWallet = async (req, res) => {
  try {
    const { id: walletId } = req.params
    const userId = req.user?.id

    const result = await withMongoSession(async (session) => {
      const wallet = await Wallet.findOne({ _id: walletId, status: 'active' })
        .populate('members.userId', 'name email')
        .session(session)

      if (!wallet) {
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }

      const uid = userId.toString()
      const memberIndex = wallet.members.findIndex((m) => m.userId?._id?.toString() === uid || m.userId?.toString() === uid)
      if (memberIndex === -1) {
        const err = new Error('You are not a member of this wallet')
        err.status = 404
        throw err
      }

      const isOwner = wallet.ownerId && wallet.ownerId.toString() === uid
      const otherMembers = wallet.members.filter((m) => (m.userId?._id?.toString() || m.userId?.toString()) !== uid)

      // If owner is the only member, leaving deletes (deactivates) the shared wallet.
      if (isOwner && otherMembers.length === 0) {
        wallet.status = 'inactive'
        await wallet.save({ session })
        return { deleted: true }
      }

      // Owner cannot leave without transferring ownership.
      if (isOwner) {
        const err = new Error('Please transfer ownership before leaving')
        err.status = 400
        err.code = 'OWNER_CANNOT_LEAVE'
        err.data = {
          eligibleMembers: otherMembers.map((m) => ({
            id: m.userId?._id || m.userId,
            name: m.userId?.name,
            email: m.userId?.email,
            permission: m.permission,
            joinedAt: m.joinedAt,
          })),
        }
        throw err
      }

      // Remove member (self)
      wallet.members.splice(memberIndex, 1)
      await wallet.save({ session })
      return { deleted: false }
    })

    res.json({
      success: true,
      message: result.deleted ? 'Wallet deleted successfully' : 'Successfully left the wallet',
    })

  } catch (error) {
    console.error('Leave wallet error:', error)
    res.status(error.status || 500).json({
      success: false,
      error: error.status ? error.message : error.message || 'Failed to leave wallet',
      ...(error.code ? { code: error.code } : {}),
      ...(error.data ? { data: error.data } : {}),
    })
  }
}

// @desc    Transfer wallet ownership (Use Case U012 - Alternative Scenario)
// @route   POST /api/wallets/:id/transfer-ownership
// @access  Private (Owner only)
export const transferOwnership = async (req, res) => {
  try {
    const { id: walletId } = req.params
    const { newOwnerId } = req.body
    const currentOwnerId = req.user?.id

    if (!newOwnerId) {
      return res.status(400).json({
        success: false,
        error: 'New owner ID is required'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ success: false, error: 'Invalid walletId' })
    }
    if (!mongoose.Types.ObjectId.isValid(newOwnerId)) {
      return res.status(400).json({ success: false, error: 'Invalid newOwnerId' })
    }

    const result = await withMongoSession(async (session) => {
      const wallet = await Wallet.findOne({ _id: walletId, status: 'active' }).session(session)
      if (!wallet) {
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }

      if (!wallet.ownerId || wallet.ownerId.toString() !== currentOwnerId.toString()) {
        const err = new Error('Only current owner can transfer ownership')
        err.status = 403
        throw err
      }

      if (wallet.ownerId.toString() === newOwnerId.toString()) {
        const err = new Error('New owner must be different')
        err.status = 400
        throw err
      }

      const newOwnerMember = wallet.members?.find((m) => m.userId?.toString() === newOwnerId.toString())
      if (!newOwnerMember) {
        const err = new Error('New owner must be a member of the wallet')
        err.status = 400
        throw err
      }

      const oldOwnerId = wallet.ownerId
      wallet.ownerId = new mongoose.Types.ObjectId(newOwnerId)
      wallet.isShared = true
      newOwnerMember.permission = 'edit'

      const oldOwnerMember = wallet.members?.find((m) => m.userId?.toString() === oldOwnerId.toString())
      if (!oldOwnerMember) {
        wallet.members.push({ userId: oldOwnerId, permission: 'view', joinedAt: new Date() })
      }

      await wallet.save({ session })
      return wallet
    })

    res.json({
      success: true,
      data: {
        newOwnerId,
        walletId: result._id,
      },
      message: 'Ownership transferred successfully',
    })

  } catch (error) {
    console.error('Transfer ownership error:', error)
    res.status(error.status || 500).json({
      success: false,
      error: error.status ? error.message : error.message || 'Failed to transfer ownership',
    })
  }
}

// @desc    Remove member from wallet (Use Case U013)
// @route   DELETE /api/wallets/:id/members/:memberId
// @access  Private (Owner only)
export const removeMemberFromWallet = async (req, res) => {
  try {
    const { id: walletId, memberId } = req.params
    const ownerId = req.user?.id

    if (!mongoose.Types.ObjectId.isValid(walletId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, error: 'Invalid id' })
    }

    await withMongoSession(async (session) => {
      const wallet = await Wallet.findOne({ _id: walletId, status: 'active' }).session(session)
      if (!wallet) {
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }

      if (!wallet.ownerId || wallet.ownerId.toString() !== ownerId.toString()) {
        const err = new Error('Only wallet owner can remove members')
        err.status = 403
        throw err
      }

      // Owner cannot remove themselves
      if (memberId === ownerId.toString()) {
        const err = new Error('Owner cannot be removed')
        err.status = 400
        throw err
      }

      const idx = wallet.members.findIndex((m) => m.userId?.toString() === memberId.toString())
      if (idx === -1) {
        const err = new Error('User is not a member of this wallet')
        err.status = 404
        throw err
      }

      wallet.members.splice(idx, 1)
      await wallet.save({ session })
    })

    res.json({ success: true, message: 'Member removed successfully' })

  } catch (error) {
    console.error('Remove member error:', error)
    res.status(error.status || 500).json({
      success: false,
      error: error.status ? error.message : error.message || 'Failed to remove member',
    })
  }
}

// @desc    Set member permission (Use Case U014)
// @route   PUT /api/wallets/:id/members/:memberId/permission
// @access  Private (Owner only)
export const setMemberPermission = async (req, res) => {
  try {
    const { id: walletId, memberId } = req.params
    const { permission } = req.body
    const ownerId = req.user?.id

    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({
        success: false,
        error: 'Permission must be view or edit'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(walletId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, error: 'Invalid id' })
    }

    const updatedMember = await withMongoSession(async (session) => {
      const wallet = await Wallet.findOne({ _id: walletId, status: 'active' }).session(session)
      if (!wallet) {
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }

      if (!wallet.ownerId || wallet.ownerId.toString() !== ownerId.toString()) {
        const err = new Error('Only wallet owner can change permissions')
        err.status = 403
        throw err
      }

      if (memberId.toString() === ownerId.toString()) {
        const err = new Error('Owner cannot change their own permission')
        err.status = 400
        throw err
      }

      const member = wallet.members.find((m) => m.userId?.toString() === memberId.toString())
      if (!member) {
        const err = new Error('User is not a member of this wallet')
        err.status = 404
        throw err
      }

      member.permission = permission
      await wallet.save({ session })
      return member
    })

    res.json({
      success: true,
      data: { memberId: updatedMember.userId, permission: updatedMember.permission },
      message: 'Member permission updated successfully',
    })

  } catch (error) {
    console.error('Set member permission error:', error)
    res.status(error.status || 500).json({
      success: false,
      error: error.status ? error.message : error.message || 'Failed to update member permission',
    })
  }
}

// @desc    Get wallet members
// @route   GET /api/wallets/:id/members
// @access  Private (Members only)
export const getWalletMembers = async (req, res) => {
  try {
    const { id: walletId } = req.params
    const userId = req.user?.id

    const wallet = await Wallet.findOne({
      _id: walletId,
      status: 'active'
    }).populate('members.userId', 'name email')
      .populate('ownerId', 'name email')

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    // Check if user is member or owner
    const isMember = wallet.members.some(member =>
      member.userId._id.toString() === userId.toString()
    )
    const isOwner = wallet.ownerId && wallet.ownerId._id.toString() === userId.toString()

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You are not a member of this wallet'
      })
    }

    res.json({
      success: true,
      data: {
        owner: wallet.ownerId ? {
          id: wallet.ownerId._id,
          name: wallet.ownerId.name,
          email: wallet.ownerId.email,
          role: 'owner'
        } : null,
        members: wallet.members.map(member => ({
          id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          permission: member.permission,
          joinedAt: member.joinedAt,
          role: 'member'
        })),
        totalMembers: wallet.members.length + (wallet.ownerId ? 1 : 0)
      }
    })

  } catch (error) {
    console.error('Get wallet members error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet members',
      message: error.message
    })
  }
}