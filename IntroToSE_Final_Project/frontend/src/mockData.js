/**
 * Mock Data for Demo - Frontend Only
 * 
 * Dữ liệu giả lập để demo tất cả tính năng của ứng dụng
 * không cần backend API
 */

// ============================================================================
// USERS - Người dùng
// ============================================================================
export const mockUsers = [
  {
    id: 'user_001',
    username: 'demo_user',
    email: 'demo@example.com',
    fullName: 'Demo User',
    avatar: 'https://i.pravatar.cc/150?img=1',
    createdAt: '2024-01-01',
    preferences: {
      currency: 'USD',
      language: 'en',
      theme: 'light'
    }
  },
  {
    id: 'user_002',
    username: 'john_doe',
    email: 'john@example.com',
    fullName: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=2',
    createdAt: '2024-02-15'
  },
  {
    id: 'user_003',
    username: 'jane_smith',
    email: 'jane@example.com',
    fullName: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: '2024-03-20'
  },
  {
    id: 'user_004',
    username: 'bob_wilson',
    email: 'bob@example.com',
    fullName: 'Bob Wilson',
    avatar: 'https://i.pravatar.cc/150?img=4',
    createdAt: '2024-04-10'
  }
]

// Current logged in user
export const currentUser = mockUsers[0]

// ============================================================================
// WALLETS - Ví tiền (cá nhân và shared)
// ============================================================================
export const mockWallets = [
  {
    id: 'wallet_001',
    name: 'Main Cash',
    type: 'Cash',
    balance: 1250.50,
    currency: 'USD',
    status: 'active',
    isShared: false,
    ownerId: 'user_001',
    description: 'Daily spending money',
    createdAt: '2024-01-01',
    icon: '💵'
  },
  {
    id: 'wallet_002',
    name: 'Bank Account',
    type: 'Bank',
    balance: 15680.75,
    currency: 'USD',
    status: 'active',
    isShared: false,
    ownerId: 'user_001',
    description: 'Primary savings account',
    createdAt: '2024-01-01',
    icon: '🏦'
  },
  {
    id: 'wallet_003',
    name: 'Family Budget',
    type: 'Bank',
    balance: 8420.00,
    currency: 'USD',
    status: 'active',
    isShared: true,
    ownerId: 'user_001',
    description: 'Shared family expenses',
    createdAt: '2024-02-01',
    icon: '👨‍👩‍👧‍👦',
    members: [
      { userId: 'user_001', role: 'admin', joinedAt: '2024-02-01' },
      { userId: 'user_002', role: 'member', joinedAt: '2024-02-02' },
      { userId: 'user_003', role: 'member', joinedAt: '2024-02-03' }
    ],
    memberCount: 3,
    pendingInvitations: 1
  },
  {
    id: 'wallet_004',
    name: 'Trip to Japan 2025',
    type: 'Savings',
    balance: 3200.00,
    currency: 'USD',
    status: 'active',
    isShared: true,
    ownerId: 'user_002',
    description: 'Saving for vacation',
    createdAt: '2024-06-01',
    icon: '🗾',
    members: [
      { userId: 'user_001', role: 'member', joinedAt: '2024-06-05' },
      { userId: 'user_002', role: 'admin', joinedAt: '2024-06-01' },
      { userId: 'user_004', role: 'member', joinedAt: '2024-06-10' }
    ],
    memberCount: 3,
    pendingInvitations: 0
  },
  {
    id: 'wallet_005',
    name: 'Emergency Fund',
    type: 'Savings',
    balance: 25000.00,
    currency: 'USD',
    status: 'active',
    isShared: false,
    ownerId: 'user_001',
    description: 'Emergency savings - Do not touch',
    createdAt: '2024-01-15',
    icon: '🆘'
  },
  {
    id: 'wallet_006',
    name: 'Credit Card',
    type: 'Bank',
    balance: -450.30,
    currency: 'USD',
    status: 'active',
    isShared: false,
    ownerId: 'user_001',
    description: 'Visa Credit Card',
    createdAt: '2024-03-01',
    icon: '💳'
  }
]

// ============================================================================
// CATEGORIES - Danh mục thu chi
// ============================================================================
export const mockCategories = [
  // Income Categories
  { id: 'cat_001', name: 'Salary', type: 'income', icon: '💼', color: '#10b981', description: 'Monthly salary' },
  { id: 'cat_002', name: 'Freelance', type: 'income', icon: '💻', color: '#3b82f6', description: 'Freelance work' },
  { id: 'cat_003', name: 'Investment', type: 'income', icon: '📈', color: '#8b5cf6', description: 'Investment returns' },
  { id: 'cat_004', name: 'Gift', type: 'income', icon: '🎁', color: '#ec4899', description: 'Gifts received' },
  { id: 'cat_005', name: 'Bonus', type: 'income', icon: '🎉', color: '#f59e0b', description: 'Work bonuses' },
  
  // Expense Categories
  { id: 'cat_101', name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', description: 'Restaurants, groceries' },
  { id: 'cat_102', name: 'Transportation', type: 'expense', icon: '🚗', color: '#f97316', description: 'Gas, parking, public transport' },
  { id: 'cat_103', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', description: 'Clothing, accessories' },
  { id: 'cat_104', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8b5cf6', description: 'Movies, games, hobbies' },
  { id: 'cat_105', name: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#14b8a6', description: 'Electricity, water, internet' },
  { id: 'cat_106', name: 'Healthcare', type: 'expense', icon: '🏥', color: '#06b6d4', description: 'Medical, pharmacy' },
  { id: 'cat_107', name: 'Education', type: 'expense', icon: '📚', color: '#3b82f6', description: 'Courses, books' },
  { id: 'cat_108', name: 'Housing', type: 'expense', icon: '🏠', color: '#10b981', description: 'Rent, mortgage' },
  { id: 'cat_109', name: 'Insurance', type: 'expense', icon: '🛡️', color: '#6366f1', description: 'Life, health insurance' },
  { id: 'cat_110', name: 'Personal Care', type: 'expense', icon: '💇', color: '#f43f5e', description: 'Haircut, spa' },
  { id: 'cat_111', name: 'Gifts & Donations', type: 'expense', icon: '🎁', color: '#ec4899', description: 'Gifts for others' },
  { id: 'cat_112', name: 'Travel', type: 'expense', icon: '✈️', color: '#0ea5e9', description: 'Vacation, trips' },
  { id: 'cat_113', name: 'Other', type: 'expense', icon: '📦', color: '#64748b', description: 'Miscellaneous' }
]

// ============================================================================
// TRANSACTIONS - Giao dịch
// ============================================================================
export const mockTransactions = [
  // November 2024
  { 
    id: 'tx_001', 
    walletId: 'wallet_002',
    categoryId: 'cat_001',
    type: 'income', 
    amount: 5000.00, 
    date: '2024-11-01',
    description: 'Monthly salary - November',
    note: 'Paycheck from company',
    createdAt: '2024-11-01T09:00:00',
    account: 'Bank Account'
  },
  {
    id: 'tx_002',
    walletId: 'wallet_001',
    categoryId: 'cat_101',
    type: 'expense',
    amount: 85.50,
    date: '2024-11-02',
    description: 'Grocery shopping',
    note: 'Weekly groceries at Whole Foods',
    createdAt: '2024-11-02T14:30:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_003',
    walletId: 'wallet_001',
    categoryId: 'cat_101',
    type: 'expense',
    amount: 42.00,
    date: '2024-11-03',
    description: 'Lunch with friends',
    note: 'Italian restaurant downtown',
    createdAt: '2024-11-03T13:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_004',
    walletId: 'wallet_002',
    categoryId: 'cat_002',
    type: 'income',
    amount: 800.00,
    date: '2024-11-05',
    description: 'Freelance project',
    note: 'Website design for client',
    createdAt: '2024-11-05T16:00:00',
    account: 'Bank Account'
  },
  {
    id: 'tx_005',
    walletId: 'wallet_006',
    categoryId: 'cat_103',
    type: 'expense',
    amount: 125.99,
    date: '2024-11-06',
    description: 'New shoes',
    note: 'Nike Air Max',
    createdAt: '2024-11-06T11:00:00',
    account: 'Credit Card'
  },
  {
    id: 'tx_006',
    walletId: 'wallet_001',
    categoryId: 'cat_102',
    type: 'expense',
    amount: 60.00,
    date: '2024-11-07',
    description: 'Gas station',
    note: 'Full tank',
    createdAt: '2024-11-07T08:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_007',
    walletId: 'wallet_003',
    categoryId: 'cat_105',
    type: 'expense',
    amount: 120.50,
    date: '2024-11-08',
    description: 'Electric bill',
    note: 'Monthly electricity payment',
    createdAt: '2024-11-08T10:00:00',
    account: 'Family Budget',
    isShared: true,
    paidBy: 'user_001',
    splitBetween: ['user_001', 'user_002', 'user_003']
  },
  {
    id: 'tx_008',
    walletId: 'wallet_001',
    categoryId: 'cat_104',
    type: 'expense',
    amount: 35.00,
    date: '2024-11-09',
    description: 'Movie tickets',
    note: 'Avengers new movie',
    createdAt: '2024-11-09T19:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_009',
    walletId: 'wallet_002',
    categoryId: 'cat_108',
    type: 'expense',
    amount: 1200.00,
    date: '2024-11-10',
    description: 'Monthly rent',
    note: 'Apartment rent payment',
    createdAt: '2024-11-10T09:00:00',
    account: 'Bank Account'
  },
  {
    id: 'tx_010',
    walletId: 'wallet_001',
    categoryId: 'cat_101',
    type: 'expense',
    amount: 28.50,
    date: '2024-11-11',
    description: 'Coffee shop',
    note: 'Starbucks with colleagues',
    createdAt: '2024-11-11T15:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_011',
    walletId: 'wallet_002',
    categoryId: 'cat_106',
    type: 'expense',
    amount: 85.00,
    date: '2024-11-12',
    description: 'Doctor visit',
    note: 'Annual checkup',
    createdAt: '2024-11-12T10:30:00',
    account: 'Bank Account'
  },
  {
    id: 'tx_012',
    walletId: 'wallet_004',
    categoryId: 'cat_112',
    type: 'expense',
    amount: 450.00,
    date: '2024-11-13',
    description: 'Flight tickets',
    note: 'Tokyo round trip',
    createdAt: '2024-11-13T14:00:00',
    account: 'Trip to Japan 2025',
    isShared: true,
    paidBy: 'user_002',
    splitBetween: ['user_001', 'user_002', 'user_004']
  },
  {
    id: 'tx_013',
    walletId: 'wallet_001',
    categoryId: 'cat_107',
    type: 'expense',
    amount: 49.99,
    date: '2024-11-14',
    description: 'Online course',
    note: 'React JS masterclass',
    createdAt: '2024-11-14T11:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_014',
    walletId: 'wallet_003',
    categoryId: 'cat_101',
    type: 'expense',
    amount: 156.30,
    date: '2024-11-15',
    description: 'Family dinner',
    note: 'Weekend restaurant',
    createdAt: '2024-11-15T19:30:00',
    account: 'Family Budget',
    isShared: true,
    paidBy: 'user_002',
    splitBetween: ['user_001', 'user_002', 'user_003']
  },
  {
    id: 'tx_015',
    walletId: 'wallet_002',
    categoryId: 'cat_004',
    type: 'income',
    amount: 200.00,
    date: '2024-11-16',
    description: 'Birthday gift',
    note: 'Cash gift from family',
    createdAt: '2024-11-16T12:00:00',
    account: 'Bank Account'
  },
  {
    id: 'tx_016',
    walletId: 'wallet_001',
    categoryId: 'cat_110',
    type: 'expense',
    amount: 35.00,
    date: '2024-11-17',
    description: 'Haircut',
    note: 'Monthly haircut',
    createdAt: '2024-11-17T10:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_017',
    walletId: 'wallet_006',
    categoryId: 'cat_104',
    type: 'expense',
    amount: 89.99,
    date: '2024-11-18',
    description: 'Video game',
    note: 'New PS5 game',
    createdAt: '2024-11-18T16:00:00',
    account: 'Credit Card'
  },
  {
    id: 'tx_018',
    walletId: 'wallet_001',
    categoryId: 'cat_102',
    type: 'expense',
    amount: 15.00,
    date: '2024-11-19',
    description: 'Parking fee',
    note: 'Downtown parking',
    createdAt: '2024-11-19T13:00:00',
    account: 'Main Cash'
  },
  {
    id: 'tx_019',
    walletId: 'wallet_002',
    categoryId: 'cat_109',
    type: 'expense',
    amount: 250.00,
    date: '2024-11-20',
    description: 'Health insurance',
    note: 'Monthly premium',
    createdAt: '2024-11-20T09:00:00',
    account: 'Bank Account'
  },
  {
    id: 'tx_020',
    walletId: 'wallet_003',
    categoryId: 'cat_105',
    type: 'expense',
    amount: 85.00,
    date: '2024-11-21',
    description: 'Internet bill',
    note: 'Monthly internet',
    createdAt: '2024-11-21T10:00:00',
    account: 'Family Budget',
    isShared: true,
    paidBy: 'user_001',
    splitBetween: ['user_001', 'user_002', 'user_003']
  }
]

// ============================================================================
// ACCOUNTS - Tài khoản (legacy, có thể merge với Wallets)
// ============================================================================
export const mockAccounts = [
  {
    id: 'acc_001',
    name: 'Main Cash',
    type: 'cash',
    balance: 1250.50,
    currency: 'USD',
    icon: '💵',
    color: '#10b981'
  },
  {
    id: 'acc_002',
    name: 'Bank Account',
    type: 'bank',
    balance: 15680.75,
    currency: 'USD',
    icon: '🏦',
    color: '#3b82f6'
  },
  {
    id: 'acc_003',
    name: 'Credit Card',
    type: 'credit',
    balance: -450.30,
    currency: 'USD',
    icon: '💳',
    color: '#ef4444'
  }
]

// ============================================================================
// BUDGETS - Ngân sách
// ============================================================================
export const mockBudgets = [
  {
    id: 'budget_001',
    categoryId: 'cat_101',
    categoryName: 'Food & Dining',
    amount: 500.00,
    spent: 312.00,
    period: 'monthly',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    color: '#ef4444',
    icon: '🍔'
  },
  {
    id: 'budget_002',
    categoryId: 'cat_102',
    categoryName: 'Transportation',
    amount: 200.00,
    spent: 75.00,
    period: 'monthly',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    color: '#f97316',
    icon: '🚗'
  },
  {
    id: 'budget_003',
    categoryId: 'cat_104',
    categoryName: 'Entertainment',
    amount: 150.00,
    spent: 124.99,
    period: 'monthly',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    color: '#8b5cf6',
    icon: '🎬'
  },
  {
    id: 'budget_004',
    categoryId: 'cat_103',
    categoryName: 'Shopping',
    amount: 300.00,
    spent: 125.99,
    period: 'monthly',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    color: '#ec4899',
    icon: '🛍️'
  }
]

// ============================================================================
// SAVING GOALS - Mục tiêu tiết kiệm
// ============================================================================
export const mockSavingGoals = [
  {
    id: 'goal_001',
    name: 'New Laptop',
    targetAmount: 2000.00,
    currentAmount: 1350.00,
    currency: 'USD',
    deadline: '2024-12-31',
    icon: '💻',
    color: '#3b82f6',
    status: 'in-progress',
    createdAt: '2024-08-01'
  },
  {
    id: 'goal_002',
    name: 'Emergency Fund',
    targetAmount: 10000.00,
    currentAmount: 6500.00,
    currency: 'USD',
    deadline: '2025-06-30',
    icon: '🆘',
    color: '#ef4444',
    status: 'in-progress',
    createdAt: '2024-01-01'
  },
  {
    id: 'goal_003',
    name: 'Vacation to Europe',
    targetAmount: 5000.00,
    currentAmount: 3200.00,
    currency: 'USD',
    deadline: '2025-07-01',
    icon: '✈️',
    color: '#8b5cf6',
    status: 'in-progress',
    createdAt: '2024-05-01'
  },
  {
    id: 'goal_004',
    name: 'New Car Down Payment',
    targetAmount: 15000.00,
    currentAmount: 4200.00,
    currency: 'USD',
    deadline: '2025-12-31',
    icon: '🚗',
    color: '#10b981',
    status: 'in-progress',
    createdAt: '2024-03-01'
  }
]

// ============================================================================
// INVITATIONS - Lời mời tham gia ví chung
// ============================================================================
export const mockInvitations = [
  {
    id: 'inv_001',
    walletId: 'wallet_003',
    walletName: 'Family Budget',
    fromUserId: 'user_001',
    fromUserName: 'Demo User',
    toEmail: 'newmember@example.com',
    status: 'pending',
    message: 'Join our family budget wallet to track expenses together',
    createdAt: '2024-11-20T10:00:00',
    expiresAt: '2024-12-20T10:00:00'
  },
  {
    id: 'inv_002',
    walletId: 'wallet_004',
    walletName: 'Trip to Japan 2025',
    fromUserId: 'user_002',
    fromUserName: 'John Doe',
    toEmail: 'demo@example.com',
    status: 'accepted',
    message: 'Let\'s save together for our Japan trip!',
    createdAt: '2024-11-15T14:00:00',
    respondedAt: '2024-11-16T09:00:00'
  }
]

// ============================================================================
// REPORTS DATA - Dữ liệu báo cáo
// ============================================================================
export const mockReportsData = {
  // Income vs Expense by month
  monthlyComparison: [
    { month: 'Jan', income: 5200, expense: 3800 },
    { month: 'Feb', income: 5000, expense: 4200 },
    { month: 'Mar', income: 5500, expense: 3900 },
    { month: 'Apr', income: 5000, expense: 4500 },
    { month: 'May', income: 5800, expense: 4100 },
    { month: 'Jun', income: 5000, expense: 4800 },
    { month: 'Jul', income: 5200, expense: 4300 },
    { month: 'Aug', income: 5000, expense: 4600 },
    { month: 'Sep', income: 5400, expense: 4200 },
    { month: 'Oct', income: 5000, expense: 4900 },
    { month: 'Nov', income: 6000, expense: 4250 }
  ],
  
  // Expense by category (pie chart)
  expenseByCategory: [
    { name: 'Food & Dining', value: 1250, color: '#ef4444' },
    { name: 'Housing', value: 1200, color: '#10b981' },
    { name: 'Transportation', value: 350, color: '#f97316' },
    { name: 'Shopping', value: 280, color: '#ec4899' },
    { name: 'Entertainment', value: 220, color: '#8b5cf6' },
    { name: 'Healthcare', value: 180, color: '#06b6d4' },
    { name: 'Bills & Utilities', value: 450, color: '#14b8a6' },
    { name: 'Other', value: 320, color: '#64748b' }
  ],
  
  // Top spending categories
  topSpending: [
    { category: 'Housing', amount: 1200.00, percentage: 28.2, trend: 'stable' },
    { category: 'Food & Dining', amount: 1250.00, percentage: 29.4, trend: 'up' },
    { category: 'Bills & Utilities', amount: 450.00, percentage: 10.6, trend: 'down' },
    { category: 'Transportation', amount: 350.00, percentage: 8.2, trend: 'stable' },
    { category: 'Shopping', amount: 280.00, percentage: 6.6, trend: 'up' }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user by ID
 */
export const getUserById = (userId) => {
  return mockUsers.find(u => u.id === userId)
}

/**
 * Get wallet by ID
 */
export const getWalletById = (walletId) => {
  return mockWallets.find(w => w.id === walletId)
}

/**
 * Get category by ID
 */
export const getCategoryById = (categoryId) => {
  return mockCategories.find(c => c.id === categoryId)
}

/**
 * Get transactions by wallet ID
 */
export const getTransactionsByWallet = (walletId) => {
  return mockTransactions.filter(t => t.walletId === walletId)
}

/**
 * Get transactions by date range
 */
export const getTransactionsByDateRange = (startDate, endDate) => {
  return mockTransactions.filter(t => {
    const txDate = new Date(t.date)
    return txDate >= new Date(startDate) && txDate <= new Date(endDate)
  })
}

/**
 * Calculate total income
 */
export const calculateTotalIncome = (transactions = mockTransactions) => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate total expense
 */
export const calculateTotalExpense = (transactions = mockTransactions) => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate balance
 */
export const calculateBalance = (transactions = mockTransactions) => {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions)
}

/**
 * Get recent transactions (default: 10)
 */
export const getRecentTransactions = (limit = 10) => {
  return [...mockTransactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

/**
 * Get pending invitations for current user
 */
export const getPendingInvitations = () => {
  return mockInvitations.filter(inv => 
    inv.toEmail === currentUser.email && inv.status === 'pending'
  )
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================
export default {
  users: mockUsers,
  currentUser,
  wallets: mockWallets,
  categories: mockCategories,
  transactions: mockTransactions,
  accounts: mockAccounts,
  budgets: mockBudgets,
  savingGoals: mockSavingGoals,
  invitations: mockInvitations,
  reports: mockReportsData,
  
  // Helper functions
  getUserById,
  getWalletById,
  getCategoryById,
  getTransactionsByWallet,
  getTransactionsByDateRange,
  calculateTotalIncome,
  calculateTotalExpense,
  calculateBalance,
  getRecentTransactions,
  getPendingInvitations
}
