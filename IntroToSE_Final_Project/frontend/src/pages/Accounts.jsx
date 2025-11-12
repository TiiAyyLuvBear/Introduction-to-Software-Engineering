import React, {useState} from 'react'

const mockAccounts = [
  { id: 1, name: 'Cash', balance: 500, currency: 'USD', icon: '💵' },
  { id: 2, name: 'Bank Account', balance: 12500, currency: 'USD', icon: '🏦' },
  { id: 3, name: 'Credit Card', balance: -450, currency: 'USD', icon: '💳' },
  { id: 4, name: 'Savings', balance: 25000, currency: 'USD', icon: '🐷' },
]

export default function Accounts() {
  const [accounts, setAccounts] = useState(mockAccounts)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    currency: 'USD',
    icon: '🏦'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newAccount = {
      id: Date.now(),
      ...formData,
      balance: parseFloat(formData.balance)
    }
    setAccounts([...accounts, newAccount])
    setShowModal(false)
    setFormData({ name: '', balance: '', currency: 'USD', icon: '🏦' })
  }

  const handleDelete = (id) => {
    setAccounts(accounts.filter(a => a.id !== id))
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Accounts</h2>
        <p className="text-gray-600">Manage your accounts and wallets</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 font-medium">Total Balance</span>
          <span className="text-2xl">💰</span>
        </div>
        <div className="text-3xl font-bold text-primary mb-2">${totalBalance.toFixed(2)}</div>
        <div className="text-sm text-gray-500">Across {accounts.length} accounts</div>
      </div>

      <button 
        className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors mb-6"
        onClick={() => setShowModal(true)}
      >
        ➕ Add Account
      </button>

      <div className="bg-white rounded-lg shadow-md">
        {accounts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No accounts yet</h3>
            <p className="text-gray-600">Click "Add Account" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {accounts.map(account => (
              <div key={account.id} className="px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">
                    <span className="mr-3 text-2xl">{account.icon}</span>
                    {account.name}
                  </h4>
                  <p className="text-sm text-gray-500 ml-11">{account.currency}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div 
                    className="text-2xl font-bold"
                    style={{color: account.balance >= 0 ? '#3498db' : '#e74c3c'}}
                  >
                    ${account.balance.toFixed(2)}
                  </div>
                  <button 
                    className="bg-danger text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                    onClick={() => handleDelete(account.id)}
                  >
                    🗑️ Delete
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
              <h3 className="text-xl font-bold text-gray-800">Add Account</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Cash, Bank Account, Credit Card"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  required
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option>USD</option>
                  <option>VND</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="🏦"
                  maxLength="2"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Save Account
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
