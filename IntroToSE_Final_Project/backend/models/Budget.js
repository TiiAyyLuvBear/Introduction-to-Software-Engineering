import mongoose from 'mongoose'

/**
 * BUDGET SCHEMA
 * 
 * Budget giúp người dùng quản lý ngân sách chi tiêu theo category
 * Ví dụ: Đặt ngân sách "Ăn uống" là 5 triệu/tháng, "Di chuyển" là 2 triệu/tháng
 * 
 * Hệ thống sẽ tính tổng chi tiêu theo category và cảnh báo khi vượt budget
 */
const BudgetSchema = new mongoose.Schema({
  // User sở hữu budget này
  // App uses Firebase UID / custom string IDs for users
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },

  // Wallet áp dụng budget (required)
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    index: true,
  },
  
  // Category áp dụng budget
  // Chỉ áp dụng cho expense categories
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false, // null = budget tổng (all categories)
    default: null,
    index: true,
  },
  
  // Tên budget (nếu không chọn category)
  name: { 
    type: String,
    trim: true
  },
  
  // Số tiền giới hạn
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Budget amount must be positive']
  },
  
  // Chu kỳ budget: daily/weekly/monthly/yearly
  period: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  
  // Ngày bắt đầu budget
  startDate: { 
    type: Date, 
    required: true 
  },
  
  // Ngày kết thúc budget
  // null = không có end date (recurring budget)
  endDate: { 
    type: Date 
  },
  
  // Số tiền đã chi trong chu kỳ hiện tại
  // Được tính toán từ transactions
  spent: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Cảnh báo khi chi tiêu đạt X% budget
  alertThreshold: {
    type: Number,
    default: 80, // Alert at 80%
    min: 0,
    max: 100
  },
  
  // Có gửi thông báo khi vượt ngưỡng không
  enableAlerts: {
    type: Boolean,
    default: true
  },
  
  // Trạng thái budget
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  }
}, { 
  timestamps: true 
})

// Index để query nhanh budgets của user
BudgetSchema.index({ userId: 1, status: 1 })
BudgetSchema.index({ userId: 1, walletId: 1, status: 1 })
BudgetSchema.index({ userId: 1, walletId: 1, categoryId: 1, period: 1, status: 1 })

/**
 * METHOD: Tính % chi tiêu so với budget
 */
BudgetSchema.methods.getSpendingPercentage = function() {
  if (this.amount === 0) return 0
  return Math.round((this.spent / this.amount) * 100)
}

/**
 * METHOD: Kiểm tra có vượt ngưỡng cảnh báo không
 */
BudgetSchema.methods.isOverThreshold = function() {
  return this.getSpendingPercentage() >= this.alertThreshold
}

/**
 * METHOD: Kiểm tra có vượt budget không
 */
BudgetSchema.methods.isOverBudget = function() {
  return this.spent > this.amount
}

/**
 * METHOD: Lấy thời gian còn lại của chu kỳ
 */
BudgetSchema.methods.getRemainingDays = function() {
  if (!this.endDate) return null
  const now = new Date()
  const diff = this.endDate - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * METHOD: Format thông tin budget để hiển thị
 */
BudgetSchema.methods.getDisplayInfo = function() {
  return {
    id: this._id,
    name: this.name,
    userId: this.userId,
    walletId: this.walletId?.toString?.() || this.walletId,
    categoryId: this.categoryId?.toString?.() || this.categoryId,
    amount: this.amount,
    spent: this.spent,
    remaining: Math.max(0, this.amount - this.spent),
    percentage: this.getSpendingPercentage(),
    period: this.period,
    startDate: this.startDate,
    endDate: this.endDate,
    remainingDays: this.getRemainingDays(),
    isOverBudget: this.isOverBudget(),
    isOverThreshold: this.isOverThreshold(),
    alertThreshold: this.alertThreshold,
    enableAlerts: this.enableAlerts,
    status: this.status
  }
}

/**
 * STATIC METHOD: Tạo budget mới với validation
 */
BudgetSchema.statics.createBudget = async function(budgetData) {
  // Validate: không tạo budget trùng category + period
  const existing = await this.findOne({
    userId: budgetData.userId,
    walletId: budgetData.walletId,
    categoryId: budgetData.categoryId || null,
    period: budgetData.period,
    status: 'active'
  })

  if (existing) {
    throw new Error('Budget for this category and period already exists')
  }
  
  const budget = new this(budgetData)
  await budget.save()
  return budget.getDisplayInfo()
}

/**
 * STATIC METHOD: Update spent amount khi có transaction mới
 * Gọi method này trong transactionController khi create/update/delete transaction
 */
BudgetSchema.statics.updateSpentAmount = async function(userId, categoryId, periodStart, periodEnd) {
  const Transaction = mongoose.model('Transaction')
  
  // Tính tổng chi tiêu của category trong khoảng thời gian
  const result = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        categoryId: categoryId,
        type: 'expense',
        date: { $gte: periodStart, $lte: periodEnd }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ])
  
  const spent = result.length > 0 ? result[0].total : 0
  
  // Update budget
  await this.updateMany(
    {
      userId,
      categoryId: categoryId || null,
      startDate: { $lte: periodEnd },
      $or: [
        { endDate: { $gte: periodStart } },
        { endDate: null }
      ],
      status: 'active'
    },
    { $set: { spent } }
  )
  
  return spent
}

/**
 * STATIC METHOD: Lấy tất cả budgets của user
 */
BudgetSchema.statics.getUserBudgets = async function(userId, options = {}) {
  const { status = 'active', period } = options
  
  const query = { userId, status }
  if (period) query.period = period
  
  const budgets = await this.find(query)
    .populate('categoryId', 'name type color')
    .populate('walletId', 'name type currency ownerId userId isShared members status')
    .sort({ createdAt: -1 })
  
  return budgets.map(budget => budget.getDisplayInfo())
}

export default mongoose.model('Budget', BudgetSchema)
