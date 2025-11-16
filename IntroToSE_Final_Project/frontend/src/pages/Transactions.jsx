/**
 * Transactions Page - Quản lý giao dịch thu/chi
 * 
 * Features:
 * 1. Hiển thị danh sách tất cả transactions (scrollable)
 * 2. Nút "Add Transaction" mở modal form
 * 3. Modal form với các fields:
 *    - Type toggle: Income/Expense
 *    - Category (text input)
 *    - Amount (number)
 *    - Date (date picker)
 *    - Account (dropdown)
 *    - Note (textarea - optional)
 * 4. Nút Delete cho mỗi transaction
 * 
 * State:
 * - transactions: Danh sách tất cả transactions
 * - showModal: Boolean để show/hide form modal
 * - formData: Object chứa data của form
 * 
 * TODO:
 * - Connect API: POST /api/transactions, DELETE /api/transactions/:id
 * - Validation: amount > 0, category required
 * - Filter: Theo type, category, date range
 * - Pagination hoặc infinite scroll
 */
import React, {useState} from 'react'

// Mock data (thay bằng API call sau)
const mockTransactions = [
  { id: 1, category: 'Salary', type: 'income', amount: 5000, date: '2025-11-01', note: 'Monthly salary', account: 'Bank Account' },
  { id: 2, category: 'Groceries', type: 'expense', amount: 150, date: '2025-11-05', note: 'Weekly shopping', account: 'Credit Card' },
  { id: 3, category: 'Restaurant', type: 'expense', amount: 45, date: '2025-11-07', note: 'Dinner with friends', account: 'Cash' },
  { id: 4, category: 'Freelance', type: 'income', amount: 800, date: '2025-11-08', note: 'Web design project', account: 'Bank Account' },
  { id: 5, category: 'Transportation', type: 'expense', amount: 60, date: '2025-11-09', note: 'Gas and parking', account: 'Credit Card' },
  { id: 6, category: 'Utilities', type: 'expense', amount: 120, date: '2025-11-03', note: 'Electricity bill', account: 'Bank Account' },
  { id: 7, category: 'Shopping', type: 'expense', amount: 200, date: '2025-11-06', note: 'New clothes', account: 'Credit Card' },
]

export default function Transactions() {
  // State: Danh sách transactions (local, sẽ sync với API sau)
  const [transactions, setTransactions] = useState(mockTransactions)
  
  // State: Show/hide modal
  const [showModal, setShowModal] = useState(false)
  
  /**
   * State: Form data
   * Default values:
   * - type: 'expense' (phần lớn transactions là chi tiêu)
   * - date: Hôm nay
   * - account: 'Cash'
   */
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    note: '',
    account: 'Cash'
  })

  /**
   * Handler: Submit form (thêm transaction mới)
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Tạo object transaction mới với unique ID
   * 3. Parse amount từ string sang number
   * 4. Thêm vào đầu array (unshift) để hiển thị mới nhất trước
   * 5. Đóng modal và reset form
   * 
   * TODO: Gọi API POST /api/transactions thay vì update local state
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    const newTx = {
      id: Date.now(),  // Temporary ID (API sẽ generate ObjectId thực)
      ...formData,
      amount: parseFloat(formData.amount)  // Convert string to number
    }
    setTransactions([newTx, ...transactions])  // Thêm vào đầu array
    setShowModal(false)
    
    // Reset form về default
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      account: 'Cash'
    })
  }

  /**
   * Handler: Xóa transaction
   * 
   * Filter out transaction có id trùng
   * TODO: Gọi API DELETE /api/transactions/:id
   */
  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Transactions</h2>
        <p className="text-gray-600">Manage your income and expenses</p>
      </div>

      <button 
        className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors mb-6"
        onClick={() => setShowModal(true)}
      >
        ➕ Add Transaction
      </button>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">All Transactions</h3>
          <span className="text-gray-600">{transactions.length} transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Click "Add Transaction" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map(tx => (
              <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{tx.category}</div>
                    <div className="text-sm text-gray-500">{tx.note} • {tx.account}</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className={`text-lg font-bold ${
                      tx.type === 'income' ? 'text-success' : 'text-danger'
                    }`}>
                      {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    className="bg-danger text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    onClick={() => handleDelete(tx.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add Transaction</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.type === 'income'
                      ? 'bg-success text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFormData({...formData, type: 'income'})}
                >
                  💰 Income
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.type === 'expense'
                      ? 'bg-danger text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFormData({...formData, type: 'expense'})}
                >
                  💸 Expense
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  placeholder="e.g., Food, Salary, Transport"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.account}
                  onChange={(e) => setFormData({...formData, account: e.target.value})}
                >
                  <option>Cash</option>
                  <option>Bank Account</option>
                  <option>Credit Card</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows="3"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Save Transaction
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
