import React, {useState} from 'react'

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
  const [transactions, setTransactions] = useState(mockTransactions)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    account: 'Cash'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newTx = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    }
    setTransactions([newTx, ...transactions])
    setShowModal(false)
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      account: 'Cash'
    })
  }

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <h2>Transactions</h2>
        <p>Manage your income and expenses</p>
      </div>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        ➕ Add Transaction
      </button>

      <div className="transaction-list" style={{marginTop: '20px'}}>
        <div className="list-header">
          <h3>All Transactions</h3>
          <span>{transactions.length} transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <h3>No transactions yet</h3>
            <p>Click "Add Transaction" to get started</p>
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div className="transaction-left">
                <div className={`transaction-icon-circle ${tx.type}`}>
                  {tx.type === 'income' ? '💰' : '💸'}
                </div>
                <div className="transaction-info">
                  <div className="transaction-category">{tx.category}</div>
                  <div className="transaction-note">{tx.note} • {tx.account}</div>
                </div>
              </div>
              <div className="transaction-right">
                <div className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                </div>
                <div className="transaction-date">
                  {new Date(tx.date).toLocaleDateString()}
                </div>
                <button 
                  className="btn btn-danger" 
                  style={{marginTop: '8px', padding: '4px 8px', fontSize: '12px'}}
                  onClick={() => handleDelete(tx.id)}
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
              <h3>Add Transaction</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                  onClick={() => setFormData({...formData, type: 'income'})}
                >
                  💰 Income
                </button>
                <button
                  type="button"
                  className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setFormData({...formData, type: 'expense'})}
                >
                  💸 Expense
                </button>
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  placeholder="e.g., Food, Salary, Transport"
                />
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Account</label>
                <select
                  className="form-control"
                  value={formData.account}
                  onChange={(e) => setFormData({...formData, account: e.target.value})}
                >
                  <option>Cash</option>
                  <option>Bank Account</option>
                  <option>Credit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <textarea
                  className="form-control"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows="3"
                  placeholder="Add a note..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Transaction</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
