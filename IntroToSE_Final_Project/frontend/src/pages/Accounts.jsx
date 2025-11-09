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
    <div>
      <div className="page-header">
        <h2>Accounts</h2>
        <p>Manage your accounts and wallets</p>
      </div>

      <div className="card" style={{marginBottom: '30px', maxWidth: '400px'}}>
        <div className="card-header">
          <span className="card-title">Total Balance</span>
          <span className="card-icon">💰</span>
        </div>
        <div className="card-amount balance">${totalBalance.toFixed(2)}</div>
        <div className="card-change">Across {accounts.length} accounts</div>
      </div>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        ➕ Add Account
      </button>

      <div className="account-list">
        {accounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3>No accounts yet</h3>
            <p>Click "Add Account" to get started</p>
          </div>
        ) : (
          accounts.map(account => (
            <div key={account.id} className="account-item">
              <div className="account-info">
                <h4>
                  <span style={{marginRight: '10px', fontSize: '24px'}}>{account.icon}</span>
                  {account.name}
                </h4>
                <p>{account.currency}</p>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div className="account-balance" style={{color: account.balance >= 0 ? '#3498db' : '#e74c3c'}}>
                  ${account.balance.toFixed(2)}
                </div>
                <button 
                  className="btn btn-danger" 
                  style={{padding: '8px 16px', fontSize: '13px'}}
                  onClick={() => handleDelete(account.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Account</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Account Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Cash, Bank Account, Credit Card"
                />
              </div>

              <div className="form-group">
                <label>Initial Balance</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  required
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  className="form-control"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option>USD</option>
                  <option>VND</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>

              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="🏦"
                  maxLength="2"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Account</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
