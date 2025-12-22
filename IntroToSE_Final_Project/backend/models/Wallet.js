import mongoose from 'mongoose'

/**
 * Wallet Schema - Định nghĩa ví tiền theo use case U010
 * 
 * Use Case U010 - Create Wallet:
 * - User có thể tạo ví cá nhân hoặc chia sẻ (Cash, Bank, Savings)
 * - Mỗi ví có tên duy nhất, loại, và số dư ban đầu (tùy chọn)
 * - Hỗ trợ validation để đảm bảo tên ví không trùng lặp
 * - Performance: tạo ví phải hoàn thành trong 1 giây
 */
const WalletSchema = new mongoose.Schema({
  // Tên ví - phải unique trong cùng một user để tránh trùng lặp
  name: { 
    type: String, 
    required: [true, 'Wallet name is required'],
    trim: true,
    maxLength: [50, 'Wallet name cannot exceed 50 characters']
  },
  
  // Loại ví: Cash / Bank / Savings
  type: { 
    type: String, 
    required: [true, 'Wallet type is required'],
    enum: {
      values: ['Cash', 'Bank', 'Savings'],
      message: 'Wallet type must be Cash, Bank, or Savings'
    }
  },
  
  // Số dư ban đầu (tùy chọn, mặc định là 0)
  initialBalance: { 
    type: Number, 
    default: 0,
    min: [0, 'Initial balance cannot be negative']
  },
  
  // Số dư hiện tại (được tính toán từ các giao dịch)
  currentBalance: { 
    type: Number, 
    default: function() { return this.initialBalance || 0 }
  },
  
  // Đơn vị tiền tệ
  currency: { 
    type: String, 
    default: 'USD',
    enum: ['USD', 'VND', 'EUR', 'JPY']
  },
  
  // Có phải ví chia sẻ không (cho tương lai mở rộng)
  isShared: { 
    type: Boolean, 
    default: false 
  },
  
  // ID của user sở hữu ví (owner)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Owner của shared wallet (chỉ áp dụng cho isShared = true)
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Danh sách thành viên của shared wallet
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Danh sách lời mời đang pending
  invitations: [{
    inviteeEmail: {
      type: String,
      required: true
    },
    inviteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date
    },
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    }
  }],
  
  // Mô tả ví (tùy chọn)
  description: { 
    type: String, 
    maxLength: [200, 'Description cannot exceed 200 characters'] 
  },
  
  // Trạng thái ví (active/inactive)
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { 
  timestamps: true 
})

// Index để đảm bảo tên ví unique trong cùng user
WalletSchema.index({ name: 1, userId: 1 }, { unique: true })

// Virtual để tính tổng số giao dịch (nếu cần thiết)
WalletSchema.virtual('transactionCount', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'walletId',
  count: true
})

// Pre-save middleware để validate tên ví không trùng lặp
WalletSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('name')) {
    const existingWallet = await this.constructor.findOne({
      name: this.name,
      userId: this.userId,
      _id: { $ne: this._id }
    })
    
    if (existingWallet) {
      const error = new Error('Wallet name already in use')
      error.code = 'DUPLICATE_WALLET_NAME'
      return next(error)
    }
  }
  next()
})

// Method để cập nhật số dư
WalletSchema.methods.updateBalance = function(amount) {
  this.currentBalance += amount
  return this.save()
}

// Method để lấy thông tin ví với format đẹp
WalletSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    balance: this.currentBalance,
    currency: this.currency,
    isShared: this.isShared,
    status: this.status,
    ownerId: this.ownerId,
    memberCount: this.members?.length || 0,
    pendingInvitations: this.invitations?.filter(inv => inv.status === 'pending').length || 0,
    createdAt: this.createdAt
  }
}

// Use Case U011: Invite Member to Wallet
WalletSchema.methods.inviteMember = async function(inviterUserId, inviteeEmail, inviteeUserId = null) {
  // Check if user is owner
  if (!this.ownerId || this.ownerId.toString() !== inviterUserId.toString()) {
    throw new Error('Only wallet owner can invite members')
  }
  
  // Check if user already invited or member
  const existingInvitation = this.invitations.find(inv => 
    inv.inviteeEmail === inviteeEmail && inv.status === 'pending'
  )
  if (existingInvitation) {
    throw new Error('User already invited')
  }
  
  const existingMember = this.members.find(member => 
    member.userId.toString() === inviteeUserId?.toString()
  )
  if (existingMember) {
    throw new Error('User already a member')
  }
  
  // Create invitation
  this.invitations.push({
    inviteeEmail,
    inviteeId: inviteeUserId,
    inviterId: inviterUserId,
    status: 'pending'
  })
  
  await this.save()
  return this.invitations[this.invitations.length - 1]
}

// Use Case U011: Accept/Decline Invitation
WalletSchema.methods.respondToInvitation = async function(invitationId, userId, response) {
  const invitation = this.invitations.id(invitationId)
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  
  if (invitation.inviteeId?.toString() !== userId.toString()) {
    throw new Error('Only invited user can respond to invitation')
  }
  
  if (invitation.status !== 'pending') {
    throw new Error('Invitation already responded to')
  }
  
  if (new Date() > invitation.expiresAt) {
    invitation.status = 'expired'
    await this.save()
    throw new Error('Invitation has expired')
  }
  
  invitation.status = response // 'accepted' or 'declined'
  invitation.respondedAt = new Date()
  
  if (response === 'accepted') {
    // Add user to members
    this.members.push({
      userId: userId,
      permission: 'view', // default permission
      joinedAt: new Date()
    })
  }
  
  await this.save()
  return invitation
}

// Use Case U012: Leave Shared Wallet
WalletSchema.methods.removeMember = async function(memberUserId, removedByUserId) {
  // Find member
  const memberIndex = this.members.findIndex(member => 
    member.userId.toString() === memberUserId.toString()
  )
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this wallet')
  }
  
  // Check if trying to remove owner
  if (this.ownerId && this.ownerId.toString() === memberUserId.toString()) {
    throw new Error('Owner cannot be removed. Transfer ownership first.')
  }
  
  // Check permissions - only owner or self can remove
  const isOwner = this.ownerId && this.ownerId.toString() === removedByUserId.toString()
  const isSelf = memberUserId.toString() === removedByUserId.toString()
  
  if (!isOwner && !isSelf) {
    throw new Error('Only wallet owner or the member themselves can remove membership')
  }
  
  // Remove member
  this.members.splice(memberIndex, 1)
  
  // If no members left and it's a shared wallet, delete it
  if (this.isShared && this.members.length === 0) {
    this.status = 'inactive'
  }
  
  await this.save()
  return true
}

// Use Case U012: Transfer Ownership
WalletSchema.methods.transferOwnership = async function(currentOwnerId, newOwnerId) {
  // Verify current owner
  if (!this.ownerId || this.ownerId.toString() !== currentOwnerId.toString()) {
    throw new Error('Only current owner can transfer ownership')
  }
  
  // Verify new owner is a member
  const newOwnerMember = this.members.find(member => 
    member.userId.toString() === newOwnerId.toString()
  )
  if (!newOwnerMember) {
    throw new Error('New owner must be a member of the wallet')
  }
  
  // Transfer ownership
  const oldOwnerId = this.ownerId
  this.ownerId = newOwnerId
  
  // Set new owner permission to edit
  newOwnerMember.permission = 'edit'
  
  // Add old owner as regular member if not already
  const oldOwnerMember = this.members.find(member => 
    member.userId.toString() === oldOwnerId.toString()
  )
  if (!oldOwnerMember) {
    this.members.push({
      userId: oldOwnerId,
      permission: 'view',
      joinedAt: new Date()
    })
  }
  
  await this.save()
  return true
}

// Use Case U014: Set Member Permission
WalletSchema.methods.setMemberPermission = async function(ownerId, memberUserId, permission) {
  // Verify owner
  if (!this.ownerId || this.ownerId.toString() !== ownerId.toString()) {
    throw new Error('Only wallet owner can change permissions')
  }
  
  // Find member
  const member = this.members.find(member => 
    member.userId.toString() === memberUserId.toString()
  )
  if (!member) {
    throw new Error('User is not a member of this wallet')
  }
  
  // Prevent owner from changing own permission
  if (memberUserId.toString() === ownerId.toString()) {
    throw new Error('Owner cannot change their own permission')
  }
  
  // Validate permission
  if (!['view', 'edit'].includes(permission)) {
    throw new Error('Invalid permission. Must be view or edit')
  }
  
  member.permission = permission
  await this.save()
  return member
}

// Static method để tạo ví mới với validation
WalletSchema.statics.createWallet = async function(walletData) {
  const wallet = new this(walletData)

  // Always set ownerId (even for personal wallets)
  if (!wallet.ownerId) {
    wallet.ownerId = walletData.userId
  }
  
  // If creating shared wallet, ensure owner is in members with edit permission
  if (walletData.isShared) {
    const ownerId = wallet.ownerId?.toString()
    const hasOwnerMember = Array.isArray(wallet.members) && wallet.members.some(m => m.userId?.toString() === ownerId)
    if (!hasOwnerMember && wallet.ownerId) {
      wallet.members.push({ userId: wallet.ownerId, permission: 'edit', joinedAt: new Date() })
    }
  }
  
  await wallet.save()
  return wallet.getDisplayInfo()
}

// Static method để lấy danh sách ví của user
WalletSchema.statics.getUserWallets = async function(userId, status = 'active') {
  const wallets = await this.find({
    status,
    $or: [
      { userId },
      { ownerId: userId },
      { 'members.userId': userId },
    ],
  }).sort({ createdAt: -1 })

  const uid = userId?.toString()
  return wallets.map((wallet) => {
    const info = wallet.getDisplayInfo()
    const ownerId = wallet.ownerId?.toString()
    const primaryOwnerId = wallet.userId?.toString()

    let myPermission = null
    if (uid && (ownerId === uid || primaryOwnerId === uid)) {
      myPermission = 'owner'
    } else if (uid && Array.isArray(wallet.members)) {
      const member = wallet.members.find((m) => m.userId?.toString() === uid)
      myPermission = member?.permission || null
    }

    return { ...info, myPermission }
  })
}

export default mongoose.model('Wallet', WalletSchema)
