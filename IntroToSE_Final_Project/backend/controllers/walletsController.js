import Wallet from '../models/Wallet.js'
import Invitation from '../models/Invitation.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

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
    const { name, type, initialBalance, currency, description, isShared } = req.body
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
        userId,
        isShared: Boolean(isShared)
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

    const wallets = await Wallet.getUserWallets(userId, status)

    // Calculate total balance across all wallets
    const totalBalance = wallets.reduce((sum, wallet) => {
      // In real app, implement currency conversion
      return sum + wallet.balance
    }, 0)

    res.json({
      success: true,
      data: {
        wallets,
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

    const wallet = await Wallet.findOne({ _id: id, status: 'active' })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    if (!canViewWallet(wallet, userId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this wallet'
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

    const wallet = await Wallet.findOne({ _id: id })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    if (!isWalletOwner(wallet, userId)) {
      return res.status(403).json({
        success: false,
        error: 'Only wallet owner can update wallet'
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
      // Only allow currency change if wallet has no transactions
      const hasTx = await Transaction.exists({ walletId: wallet._id })
      if (hasTx) {
        return res.status(400).json({
          success: false,
          error: 'Cannot change currency after transactions exist',
          code: 'CURRENCY_CHANGE_NOT_ALLOWED'
        })
      }
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

    const wallet = await Wallet.findOne({ _id: id, status: 'active' })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    if (!isWalletOwner(wallet, userId)) {
      return res.status(403).json({
        success: false,
        error: 'Only wallet owner can delete wallet'
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

    // Check if user is owner
    if (!wallet.ownerId || wallet.ownerId.toString() !== inviterId.toString()) {
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
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Check if user already a member
    const existingMember = wallet.members.find(member => 
      member.userId._id.toString() === invitee._id.toString()
    )
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
          expiresAt: invitation.expiresAt,
          token: invitation.invitationToken
        }
      },
      processingTime: `${endTime - startTime}ms`,
      message: 'Invitation sent successfully'
    })

  } catch (error) {
    console.error('Invite member error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation',
      message: error.message
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

    // Find invitation
    const invitation = await Invitation.findById(invitationId)
      .populate('walletId', 'name type')
      .populate('inviterId', 'name')

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      })
    }

    // Verify invitee
    if (invitation.inviteeId?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only invited user can respond to invitation'
      })
    }

    // Handle response
    if (response === 'accept') {
      await invitation.accept(userId)
      
      // Add user to wallet members
      const wallet = await Wallet.findById(invitation.walletId._id)
      wallet.members.push({
        userId: userId,
        permission: 'view',
        joinedAt: new Date()
      })
      await wallet.save()

      res.json({
        success: true,
        data: {
          walletId: wallet._id,
          walletName: wallet.name,
          permission: 'view',
          memberCount: wallet.members.length
        },
        message: 'Invitation accepted successfully'
      })

    } else {
      await invitation.decline(userId)
      
      res.json({
        success: true,
        message: 'Invitation declined'
      })
    }

  } catch (error) {
    console.error('Respond to invitation error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to respond to invitation'
    })
  }
}

// @desc    Get pending invitations for user
// @route   GET /api/invitations/pending
// @access  Private
export const getPendingInvitations = async (req, res) => {
  try {
    const userEmail = req.user?.email

    const invitations = await Invitation.getPendingForUser(userEmail)

    res.json({
      success: true,
      data: {
        invitations: invitations.map(inv => ({
          id: inv._id,
          wallet: {
            id: inv.walletId._id,
            name: inv.walletId.name,
            type: inv.walletId.type
          },
          inviter: {
            name: inv.inviterId.name,
            email: inv.inviterId.email
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

    const wallet = await Wallet.findOne({ 
      _id: walletId, 
      status: 'active' 
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    // Check if user is a member
    const memberIndex = wallet.members.findIndex(member => 
      member.userId.toString() === userId.toString()
    )

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'You are not a member of this wallet'
      })
    }

    // Alternative Scenario 4a: Owner cannot leave without transferring ownership
    if (wallet.ownerId && wallet.ownerId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Please transfer ownership before leaving',
        code: 'OWNER_CANNOT_LEAVE',
        data: {
          eligibleMembers: wallet.members
            .filter(m => m.userId.toString() !== userId.toString())
            .map(m => ({ 
              id: m.userId, 
              permission: m.permission,
              joinedAt: m.joinedAt 
            }))
        }
      })
    }

    // Remove member
    await wallet.removeMember(userId, userId)

    res.json({
      success: true,
      message: 'Successfully left the wallet'
    })

  } catch (error) {
    console.error('Leave wallet error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to leave wallet'
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

    const wallet = await Wallet.findOne({ 
      _id: walletId, 
      status: 'active' 
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    await wallet.transferOwnership(currentOwnerId, newOwnerId)

    res.json({
      success: true,
      data: {
        newOwnerId,
        walletId: wallet._id
      },
      message: 'Ownership transferred successfully'
    })

  } catch (error) {
    console.error('Transfer ownership error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transfer ownership'
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

    const wallet = await Wallet.findOne({ 
      _id: walletId, 
      status: 'active' 
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    // Alternative Scenario 3a: Owner tries to remove themselves
    if (memberId === ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Owner cannot be removed'
      })
    }

    await wallet.removeMember(memberId, ownerId)

    res.json({
      success: true,
      message: 'Member removed successfully'
    })

  } catch (error) {
    console.error('Remove member error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove member'
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

    const wallet = await Wallet.findOne({ 
      _id: walletId, 
      status: 'active' 
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      })
    }

    const updatedMember = await wallet.setMemberPermission(ownerId, memberId, permission)

    res.json({
      success: true,
      data: {
        memberId: updatedMember.userId,
        permission: updatedMember.permission
      },
      message: 'Member permission updated successfully'
    })

  } catch (error) {
    console.error('Set member permission error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update member permission'
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