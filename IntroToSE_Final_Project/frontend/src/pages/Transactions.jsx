import React, {useState, useEffect} from 'react'
import api from '../api'

export default function Transactions() {
  // Toggle this to `true` when backend is ready. For now the UI works fully client-side.
  const useBackend = false

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    account: 'Cash'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferData, setTransferData] = useState({
    from: 'Bank Account',
    to: 'Cash',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [detailsNote, setDetailsNote] = useState('')

  useEffect(() => {
    if (useBackend) {
      const fetchTx = async () => {
        setLoading(true)
        try {
          const res = await api.get('/transactions')
          setTransactions(res.data)
        } catch (err) {
          setError(err.message || 'Failed to load transactions')
        } finally {
          setLoading(false)
        }
      }
      fetchTx()
    } else {
      // Load from localStorage or use a small demo set
      const saved = localStorage.getItem('transactions_demo')
      if (saved) {
        try { setTransactions(JSON.parse(saved)) } catch(e) { setTransactions([]) }
      } else {
        const demo = [
          { _id: 't1', category: 'Salary', type: 'income', amount: 5000, date: '2025-11-01', note: 'Monthly salary', account: 'Bank Account' },
          { _id: 't2', category: 'Groceries', type: 'expense', amount: 150, date: '2025-11-05', note: 'Weekly shopping', account: 'Credit Card' }
        ]
        setTransactions(demo)
        localStorage.setItem('transactions_demo', JSON.stringify(demo))
      }
    }
  }, [])

  // If backend is enabled, allow searching via query param (debounced)
  useEffect(() => {
    if (!useBackend) return
    let mounted = true
    let t = null
    const doSearch = async () => {
      setIsSearching(true)
      try {
        const res = await api.get('/transactions', { params: { q: searchTerm } })
        if (mounted) setTransactions(res.data)
      } catch (err) {
        if (mounted) setError(err.message || 'Search failed')
      } finally {
        if (mounted) setIsSearching(false)
      }
    }
    // debounce
    t = setTimeout(() => doSearch(), 300)
    return () => { mounted = false; clearTimeout(t) }
  }, [searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const payload = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      account: formData.account,
      date: formData.date,
      note: formData.note
    }
    try {
      if (useBackend) {
        if (isEditing && editingId) {
          const res = await api.put(`/transactions/${editingId}`, payload)
          setTransactions(prev => prev.map(t => t._id === res.data._id ? res.data : t))
        } else {
          const res = await api.post('/transactions', payload)
          // prepend the created transaction returned by backend
          setTransactions(prev => [res.data, ...prev])
        }
      } else {
        // Client-side demo flow: create or update locally and persist to localStorage
        if (isEditing && editingId) {
          const updated = { ...payload, _id: editingId }
          setTransactions(prev => {
            const next = prev.map(t => t._id === editingId ? updated : t)
            localStorage.setItem('transactions_demo', JSON.stringify(next))
            return next
          })
        } else {
          const newTx = { ...payload, _id: 'tx_' + Date.now() }
          setTransactions(prev => {
            const next = [newTx, ...prev]
            localStorage.setItem('transactions_demo', JSON.stringify(next))
            return next
          })
        }
      }
      setShowModal(false)
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        account: 'Cash'
      })
      setIsEditing(false)
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save transaction')
    }
  }

  const handleDelete = async (id) => {
    setError(null)
    try {
      if (useBackend) {
        await api.delete(`/transactions/${id}`)
        setTransactions(prev => prev.filter(t => t._id !== id))
      } else {
        const next = transactions.filter(t => t._id !== id)
        setTransactions(next)
        localStorage.setItem('transactions_demo', JSON.stringify(next))
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete')
    }
  }

  const handleEdit = (tx) => {
    setFormData({
      type: tx.type || 'expense',
      category: tx.category || '',
      amount: (tx.amount || 0).toString(),
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: tx.note || '',
      account: tx.account || 'Cash'
    })
    setIsEditing(true)
    setEditingId(tx._id)
    setShowModal(true)
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

      <button className="btn" style={{marginLeft:8}} onClick={() => setShowTransfer(true)}>🔁 Transfer</button>

      <div style={{display:'inline-block', marginLeft:12}}>
        <input
          type="search"
          className="form-control"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{minWidth: 240}}
        />
      </div>

      <div className="transaction-list" style={{marginTop: '20px'}}>
        <div className="list-header">
          <h3>All Transactions</h3>
          <span>{transactions.length} transactions{isSearching ? ' (searching...)' : ''}</span>
        </div>
        {loading || isSearching ? (
          <p>Loading transactions...</p>
        ) : (transactions.length === 0) ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <h3>No transactions yet</h3>
            <p>Click "Add Transaction" to get started</p>
          </div>
        ) : (
          // apply client-side filtering when backend is not used
          (() => {
            const term = searchTerm.trim().toLowerCase()
            const filtered = term === '' ? transactions : transactions.filter(tx => {
              const s = [tx.category, tx.note, tx.account, tx.type, String(tx.amount), new Date(tx.date).toLocaleDateString()].join(' ').toLowerCase()
              return s.indexOf(term) !== -1
            })
            if (filtered.length === 0) {
              return (
                <div className="empty-state">
                  <div className="empty-state-icon">🔎</div>
                  <h3>No matching transactions</h3>
                  <p>Try a different search or clear the filter.</p>
                </div>
              )
            }

            return filtered.map(tx => (
            <div key={tx._id} className="transaction-item" onClick={() => { setSelectedTransaction(tx); setDetailsNote(tx.detailsNote || ''); }}>
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
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button className="btn btn-secondary" style={{padding:'4px 8px', fontSize:12}} onClick={(e) => { e.stopPropagation(); handleEdit(tx) }}>✏️ Edit</button>
                  <button className="btn btn-danger" style={{padding:'4px 8px', fontSize:12}} onClick={(e) => { e.stopPropagation(); handleDelete(tx._id) }}>🗑️ Delete</button>
                </div>
              </div>
            </div>
            ))
          })()
        )}
        {error && <div className="msg error" style={{marginTop:12}}>{error}</div>}
      </div>

      {selectedTransaction && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button className="close-btn" onClick={() => setSelectedTransaction(null)}>×</button>
            </div>

            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <div className={`transaction-icon-circle ${selectedTransaction.type}`} style={{fontSize: '28px'}}>
                  {selectedTransaction.type === 'income' ? '💰' : '💸'}
                </div>
                <div>
                  <div style={{fontSize: '14px', color: '#7f8c8d'}}>
                    {selectedTransaction.type === 'expense' ? 'Expense' : 'Income'}
                  </div>
                  <div style={{fontSize: '28px', fontWeight: 'bold', color: selectedTransaction.type === 'expense' ? '#e74c3c' : '#27ae60'}}>
                    {selectedTransaction.type === 'expense' ? '-' : '+'}${selectedTransaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
                <div style={{marginBottom: '12px'}}>
                  <div style={{fontSize: '12px', color: '#7f8c8d', marginBottom: '4px'}}>Category</div>
                  <div style={{fontWeight: '600'}}>{selectedTransaction.category}</div>
                </div>
                <div style={{marginBottom: '12px'}}>
                  <div style={{fontSize: '12px', color: '#7f8c8d', marginBottom: '4px'}}>Account</div>
                  <div style={{fontWeight: '600'}}>{selectedTransaction.account}</div>
                </div>
                <div style={{marginBottom: '12px'}}>
                  <div style={{fontSize: '12px', color: '#7f8c8d', marginBottom: '4px'}}>Date</div>
                  <div style={{fontWeight: '600'}}>{new Date(selectedTransaction.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#7f8c8d', marginBottom: '4px'}}>Note</div>
                  <div style={{fontWeight: '600'}}>{selectedTransaction.note || 'No note'}</div>
                </div>
              </div>

              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Details & Notes</label>
                <textarea
                  className="form-control"
                  value={detailsNote}
                  onChange={(e) => setDetailsNote(e.target.value)}
                  rows="4"
                  placeholder="Add details, receipt info, or repeat instructions here..."
                />
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const updated = {...selectedTransaction, detailsNote}
                    const next = transactions.map(t => t._id === updated._id ? updated : t)
                    setTransactions(next)
                    localStorage.setItem('transactions_demo', JSON.stringify(next))
                    setSelectedTransaction(null)
                  }}
                >
                  💾 Save Details
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedTransaction(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {showTransfer && (
        <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transfer Funds</h3>
              <button className="close-btn" onClick={() => setShowTransfer(false)}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const amt = parseFloat(transferData.amount)
              if (!amt || amt <= 0) return setError('Enter a valid amount for transfer')
              if (transferData.from === transferData.to) return setError('Select different source and destination accounts')

              // Create two transactions: expense from source, income to destination
              const txFrom = {
                _id: 'tx_' + Date.now() + '_from',
                amount: amt,
                type: 'expense',
                category: `Transfer to ${transferData.to}`,
                account: transferData.from,
                date: transferData.date,
                note: transferData.note || `Transfer to ${transferData.to}`
              }
              const txTo = {
                _id: 'tx_' + (Date.now()+1) + '_to',
                amount: amt,
                type: 'income',
                category: `Transfer from ${transferData.from}`,
                account: transferData.to,
                date: transferData.date,
                note: transferData.note || `Transfer from ${transferData.from}`
              }

              try {
                if (useBackend) {
                  // backend approach: post two transactions (or implement a /transfer endpoint server-side)
                  await api.post('/transactions', {...txFrom, amount: txFrom.amount})
                  await api.post('/transactions', {...txTo, amount: txTo.amount})
                  // re-fetch or optimistically insert
                  const res = await api.get('/transactions')
                  setTransactions(res.data)
                } else {
                  // client-side: persist both transactions in localStorage
                  const next = [txTo, txFrom, ...transactions]
                  setTransactions(next)
                  localStorage.setItem('transactions_demo', JSON.stringify(next))
                }
                setShowTransfer(false)
                setTransferData({from: 'Bank Account', to: 'Cash', amount: '', date: new Date().toISOString().split('T')[0], note: ''})
              } catch (err) {
                setError(err.response?.data?.error || err.message || 'Transfer failed')
              }
            }}>
              <div className="form-group">
                <label>From (source)</label>
                <select className="form-control" value={transferData.from} onChange={e => setTransferData({...transferData, from: e.target.value})}>
                  <option>Cash</option>
                  <option>Bank Account</option>
                  <option>Credit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>To (destination)</label>
                <select className="form-control" value={transferData.to} onChange={e => setTransferData({...transferData, to: e.target.value})}>
                  <option>Cash</option>
                  <option>Bank Account</option>
                  <option>Credit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input type="number" className="form-control" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} min="0" step="0.01" required />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={transferData.date} onChange={e => setTransferData({...transferData, date: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input className="form-control" value={transferData.note} onChange={e => setTransferData({...transferData, note: e.target.value})} />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Confirm Transfer</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransfer(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
