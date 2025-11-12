/**
 * Dashboard Page - Trang tổng quan tài chính
 * 
 * Features:
 * 1. Hiển thị 3 cards thống kê:
 *    - Tổng thu nhập (Total Income)
 *    - Tổng chi tiêu (Total Expense)
 *    - Số dư hiện tại (Balance = Income - Expense)
 * 
 * 2. Danh sách giao dịch gần đây (5 transactions mới nhất)
 * 
 * Data:
 * - Hiện tại dùng mock data (hardcoded)
 * - TODO: Fetch từ API GET /api/transactions khi có backend
 * 
 * Calculations:
 * - totalIncome: Sum của các transactions có type='income'
 * - totalExpense: Sum của các transactions có type='expense'
 * - balance: totalIncome - totalExpense
 */
import React, {useState} from 'react'

// Mock data để demo (thay thế bằng API call sau)
const mockTransactions = [
  { id: 1, category: 'Salary', type: 'income', amount: 5000, date: '2025-11-01', note: 'Monthly salary' },
  { id: 2, category: 'Groceries', type: 'expense', amount: 150, date: '2025-11-05', note: 'Weekly shopping' },
  { id: 3, category: 'Restaurant', type: 'expense', amount: 45, date: '2025-11-07', note: 'Dinner with friends' },
  { id: 4, category: 'Freelance', type: 'income', amount: 800, date: '2025-11-08', note: 'Web design project' },
  { id: 5, category: 'Transportation', type: 'expense', amount: 60, date: '2025-11-09', note: 'Gas and parking' },
]

export default function Dashboard() {
  // State lưu transactions (hiện tại dùng mock, sau sẽ fetch từ API)
  const [transactions] = useState(mockTransactions)

  /**
   * Tính tổng thu nhập
   * - Filter transactions có type='income'
   * - Sum amount bằng reduce
   */
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  /**
   * Tính tổng chi tiêu
   * - Filter transactions có type='expense'
   * - Sum amount
   */
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  /**
   * Tính số dư
   * Balance = Thu nhập - Chi tiêu
   */
  const balance = totalIncome - totalExpense

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your finances</p>
      </div>

      {/* Grid 3 cards: Income, Expense, Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Tổng thu nhập */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Income</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold text-success mb-2">${totalIncome.toFixed(2)}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>

        {/* Card 2: Tổng chi tiêu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Expense</span>
            <span className="text-2xl">📉</span>
          </div>
          <div className="text-3xl font-bold text-danger mb-2">${totalExpense.toFixed(2)}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>

        {/* Card 3: Số dư */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Balance</span>
            <span className="text-2xl">💵</span>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">${balance.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Current balance</div>
        </div>
      </div>

      {/* Danh sách transactions gần đây */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
        </div>
        
        {/* Chỉ hiển thị 5 transactions đầu tiên */}
        <div className="divide-y divide-gray-200">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              {/* Left side: Icon + Category + Note */}
              <div className="flex items-center gap-4">
                {/* Icon circle màu xanh (income) hoặc đỏ (expense) */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {tx.type === 'income' ? '💰' : '💸'}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{tx.category}</div>
                  <div className="text-sm text-gray-500">{tx.note}</div>
                </div>
              </div>
              
              {/* Right side: Amount + Date */}
              <div className="text-right">
                {/* Amount với dấu + (income) hoặc - (expense) */}
                <div className={`text-lg font-bold ${
                  tx.type === 'income' ? 'text-success' : 'text-danger'
                }`}>
                  {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                </div>
                {/* Format date theo locale */}
                <div className="text-sm text-gray-500">
                  {new Date(tx.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
