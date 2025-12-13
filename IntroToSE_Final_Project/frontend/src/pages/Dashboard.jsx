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
import React, { useState, useEffect } from 'react'
import { FaArrowUp, FaArrowDown, FaWallet, FaReceipt } from 'react-icons/fa'
import { mockTransactions, mockWallets, calculateTotalIncome, calculateTotalExpense, calculateBalance } from '../mockData'

export default function Dashboard() {
  // State lưu transactions từ mockData
  const [transactions] = useState(mockTransactions)
  const [wallets] = useState(mockWallets)
  
  // DEMO NOTE: API calls đã được comment trong api.js
  // Để kích hoạt lại: uncomment api.js và sử dụng:
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const txResponse = await api.get('/transactions')
  //       setTransactions(txResponse.data)
  //     } catch (error) {
  //       console.error('Failed to fetch transactions:', error)
  //     }
  //   }
  //   fetchData()
  // }, [])

  /**
   * Tính toán thống kê từ mockData
   * Sử dụng helper functions từ mockData.js
   */
  const totalIncome = calculateTotalIncome(transactions)
  const totalExpense = calculateTotalExpense(transactions)
  const balance = calculateBalance(transactions)
  
  // Tính tổng balance của tất cả các ví
  const totalWalletBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)

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
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-green-100 cursor-pointer">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">Total Income</span>
            <FaArrowUp className="w-8 h-8 text-green-600 animate-bounce" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">${totalIncome.toFixed(2)}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>

        {/* Card 2: Tổng chi tiêu */}
        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-md p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-red-100 cursor-pointer">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">Total Expense</span>
            <FaArrowDown className="w-8 h-8 text-red-600 animate-bounce" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">${totalExpense.toFixed(2)}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>

        {/* Card 3: Số dư */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-blue-100 cursor-pointer">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">Balance</span>
            <FaWallet className="w-8 h-8 text-blue-600 animate-bounce" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">${balance.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Current balance</div>
        </div>
      </div>

      {/* Danh sách transactions gần đây */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaReceipt className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
          </div>
        </div>
        
        {/* Chỉ hiển thị 5 transactions đầu tiên */}
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
              {/* Left side: Icon + Category + Note */}
              <div className="flex items-center gap-4">
                {/* Icon circle màu xanh (income) hoặc đỏ (expense) */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:rotate-12 ${
                  tx.type === 'income' ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  {tx.type === 'income' ? <FaArrowUp className="w-7 h-7 text-white" /> : <FaArrowDown className="w-7 h-7 text-white" />}
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
