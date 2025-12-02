import mongoose from 'mongoose'

/**
 * Invitation Schema - Quản lý lời mời tham gia shared wallet
 * 
 * Use Case U011: Invite Member to Wallet
 * - Lưu trữ thông tin lời mời
 * - Theo dõi trạng thái (pending/accepted/declined/expired)
 * - Tự động hết hạn sau 7 ngày
 */
const InvitationSchema = new mongoose.Schema({
  // Ví được mời tham gia
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  
  // Người gửi lời mời (owner của wallet)
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Email người được mời
  inviteeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // ID người được mời (nếu user đã tồn tại)
  inviteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Trạng thái lời mời
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  
  // Thời gian gửi lời mời
  invitedAt: {
    type: Date,
    default: Date.now
  },
  
  // Thời gian phản hồi
  respondedAt: {
    type: Date
  },
  
  // Thời gian hết hạn (7 ngày sau khi gửi)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  },
  
  // Token để xác thực lời mời (security)
  invitationToken: {
    type: String,
    required: true,
    unique: true
  },
  
  // Message từ người mời (optional)
  message: {
    type: String,
    maxLength: 200
  }
}, { 
  timestamps: true 
})

// Index để tối ưu queries
InvitationSchema.index({ walletId: 1, inviteeEmail: 1 })
InvitationSchema.index({ inviteeId: 1, status: 1 })
InvitationSchema.index({ expiresAt: 1 }) // For cleanup expired invitations

// Virtual để check xem invitation có expired không
InvitationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt && this.status === 'pending'
})

// Pre-save middleware để tự động expire invitations
InvitationSchema.pre('save', function(next) {
  if (this.status === 'pending' && new Date() > this.expiresAt) {
    this.status = 'expired'
  }
  next()
})

// Method để generate unique invitation token
InvitationSchema.methods.generateToken = function() {
  this.invitationToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  return this.invitationToken
}

// Method để accept invitation
InvitationSchema.methods.accept = async function(userId) {
  if (this.status !== 'pending') {
    throw new Error('Invitation is no longer pending')
  }
  
  if (this.isExpired) {
    this.status = 'expired'
    await this.save()
    throw new Error('Invitation has expired')
  }
  
  if (this.inviteeId && this.inviteeId.toString() !== userId.toString()) {
    throw new Error('Only invited user can accept invitation')
  }
  
  this.status = 'accepted'
  this.respondedAt = new Date()
  this.inviteeId = userId
  
  await this.save()
  return this
}

// Method để decline invitation
InvitationSchema.methods.decline = async function(userId) {
  if (this.status !== 'pending') {
    throw new Error('Invitation is no longer pending')
  }
  
  if (this.inviteeId && this.inviteeId.toString() !== userId.toString()) {
    throw new Error('Only invited user can decline invitation')
  }
  
  this.status = 'declined'
  this.respondedAt = new Date()
  this.inviteeId = userId
  
  await this.save()
  return this
}

// Static method để cleanup expired invitations
InvitationSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    { 
      status: 'pending', 
      expiresAt: { $lt: new Date() } 
    },
    { 
      status: 'expired' 
    }
  )
  return result
}

// Static method để get pending invitations for user
InvitationSchema.statics.getPendingForUser = async function(userEmail) {
  await this.cleanupExpired()
  
  return await this.find({
    inviteeEmail: userEmail.toLowerCase(),
    status: 'pending'
  }).populate('walletId', 'name type').populate('inviterId', 'name email')
}

export default mongoose.model('Invitation', InvitationSchema)