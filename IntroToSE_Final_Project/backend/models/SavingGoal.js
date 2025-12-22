import mongoose from 'mongoose'

/**
 * SAVING GOAL SCHEMA
 * 
 * Giúp người dùng đặt mục tiêu tiết kiệm cho các kế hoạch tương lai
 * Ví dụ: Mua xe (200 triệu), Du lịch Nhật (50 triệu), Mua nhà (5 tỷ)
 * 
 * Hệ thống track tiến độ và tính số tiền cần tiết kiệm mỗi tháng
 */
const SavingGoalSchema = new mongoose.Schema({
  // User sở hữu saving goal này
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Tên mục tiêu (VD: "Mua iPhone mới", "Du lịch Đà Nẵng")
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxLength: [100, 'Goal name cannot exceed 100 characters']
  },
  
  // Số tiền mục tiêu
  targetAmount: { 
    type: Number, 
    required: true,
    min: [1, 'Target amount must be greater than 0']
  },
  
  // Số tiền đã tiết kiệm được
  currentAmount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Ngày hạn (deadline)
  deadline: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date()
      },
      message: 'Deadline must be in the future'
    }
  },
  
  // Mô tả chi tiết về mục tiêu
  description: { 
    type: String,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Ảnh minh họa cho mục tiêu (URL)
  image: {
    type: String
  },
  
  // Danh sách các lần đóng góp vào mục tiêu
  contributions: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      maxLength: 200
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  }],
  
  // Wallet liên kết với saving goal (optional)
  // Nếu có, mọi contribution sẽ đến từ wallet này
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  
  // Trạng thái: active / completed / cancelled / paused
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active'
  },
  
  // Ngày hoàn thành mục tiêu
  completedAt: {
    type: Date
  },
  
  // Độ ưu tiên: high / medium / low
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
}, { 
  timestamps: true 
})

// Index để query nhanh
SavingGoalSchema.index({ userId: 1, status: 1 })
SavingGoalSchema.index({ userId: 1, deadline: 1 })
SavingGoalSchema.index({ walletId: 1, name: 1 })

/**
 * METHOD: Tính % tiến độ đã đạt được
 */
SavingGoalSchema.methods.getProgress = function() {
  if (this.targetAmount === 0) return 0
  const progress = (this.currentAmount / this.targetAmount) * 100
  return Math.min(Math.round(progress), 100)
}

/**
 * METHOD: Tính số tiền còn thiếu
 */
SavingGoalSchema.methods.getRemainingAmount = function() {
  return Math.max(0, this.targetAmount - this.currentAmount)
}

/**
 * METHOD: Tính số ngày còn lại đến deadline
 */
SavingGoalSchema.methods.getRemainingDays = function() {
  if (!this.deadline) return null
  const now = new Date()
  const diff = this.deadline - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * METHOD: Tính số tiền cần tiết kiệm mỗi tháng
 * Dựa trên remaining amount và remaining time
 */
SavingGoalSchema.methods.getMonthlyTarget = function() {
  const remaining = this.getRemainingAmount()
  const daysLeft = this.getRemainingDays()
  
  if (!daysLeft || daysLeft <= 0) return remaining
  
  const monthsLeft = Math.max(1, daysLeft / 30)
  return Math.ceil(remaining / monthsLeft)
}

/**
 * METHOD: Kiểm tra có đạt deadline không
 */
SavingGoalSchema.methods.isOnTrack = function() {
  if (!this.deadline) return true
  
  const daysLeft = this.getRemainingDays()
  if (daysLeft <= 0) return this.getProgress() >= 100
  
  const totalDays = (this.deadline - this.createdAt) / (1000 * 60 * 60 * 24)
  const expectedProgress = ((totalDays - daysLeft) / totalDays) * 100
  
  return this.getProgress() >= expectedProgress
}

/**
 * METHOD: Format thông tin để hiển thị
 */
SavingGoalSchema.methods.getDisplayInfo = function() {
  const wallet = this.walletId && this.walletId.name
    ? {
        id: this.walletId._id,
        name: this.walletId.name,
        type: this.walletId.type,
        currency: this.walletId.currency,
        currentBalance: this.walletId.currentBalance,
        isShared: this.walletId.isShared,
      }
    : null

  return {
    id: this._id,
    name: this.name,
    targetAmount: this.targetAmount,
    currentAmount: this.currentAmount,
    remaining: this.getRemainingAmount(),
    progress: this.getProgress(),
    deadline: this.deadline,
    remainingDays: this.getRemainingDays(),
    monthlyTarget: this.getMonthlyTarget(),
    isOnTrack: this.isOnTrack(),
    description: this.description,
    image: this.image,
    walletId: this.walletId,
    wallet,
    status: this.status,
    priority: this.priority,
    contributionCount: this.contributions?.length || 0,
    completedAt: this.completedAt,
    createdAt: this.createdAt
  }
}

/**
 * METHOD: Thêm contribution vào saving goal
 */
SavingGoalSchema.methods.addContribution = async function(amount, note = '', transactionId = null) {
  if (amount <= 0) {
    throw new Error('Contribution amount must be greater than 0')
  }
  
  if (this.status !== 'active') {
    throw new Error('Cannot add contribution to inactive goal')
  }
  
  // Add contribution
  this.contributions.push({
    amount,
    date: new Date(),
    note,
    transactionId
  })
  
  // Update current amount
  this.currentAmount += amount
  
  // Check if goal completed
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'completed'
    this.completedAt = new Date()
  }
  
  await this.save()
  return this.getDisplayInfo()
}

/**
 * METHOD: Remove contribution (undo)
 */
SavingGoalSchema.methods.removeContribution = async function(contributionId) {
  const contribution = this.contributions.id(contributionId)
  
  if (!contribution) {
    throw new Error('Contribution not found')
  }
  
  // Subtract amount
  this.currentAmount -= contribution.amount
  this.currentAmount = Math.max(0, this.currentAmount)
  
  // Remove contribution
  contribution.remove()
  
  // If was completed, reactivate
  if (this.status === 'completed' && this.currentAmount < this.targetAmount) {
    this.status = 'active'
    this.completedAt = null
  }
  
  await this.save()
  return this.getDisplayInfo()
}

/**
 * STATIC METHOD: Tạo saving goal mới
 */
SavingGoalSchema.statics.createGoal = async function(goalData) {
  const goal = new this(goalData)
  await goal.save()
  return goal.getDisplayInfo()
}

/**
 * STATIC METHOD: Lấy tất cả goals của user
 */
SavingGoalSchema.statics.getUserGoals = async function(userId, options = {}) {
  const { status, priority } = options
  
  const query = { userId }
  if (status) query.status = status
  if (priority) query.priority = priority
  
  const goals = await this.find(query)
    .populate('walletId', 'name type currency currentBalance isShared')
    .sort({ priority: -1, createdAt: -1 })
  
  return goals.map(goal => goal.getDisplayInfo())
}

/**
 * STATIC METHOD: Get goals by deadline (urgent first)
 */
SavingGoalSchema.statics.getGoalsByDeadline = async function(userId) {
  const goals = await this.find({ 
    userId, 
    status: 'active',
    deadline: { $exists: true, $ne: null }
  })
  .populate('walletId', 'name type currency currentBalance isShared')
  .sort({ deadline: 1 })
  
  return goals.map(goal => goal.getDisplayInfo())
}

export default mongoose.model('SavingGoal', SavingGoalSchema)
