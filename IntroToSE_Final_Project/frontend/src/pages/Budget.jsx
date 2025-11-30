import React, { useState, useEffect } from 'react'

export default function Budget() {
  const [budgets, setBudgets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    category: '',
    period: 'monthly', // monthly, yearly, custom
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Load budgets from localStorage
    const saved = localStorage.getItem('budgets_demo')
    if (saved) {
      try { setBudgets(JSON.parse(saved)) } catch (e) { setBudgets([]) }
    } else {
      const demo = [
        {
          id: 'b1',
          name: 'Groceries Monthly',
          limit: 400,
          category: 'Groceries',
          period: 'monthly',
          spent: 150,
          alerts: false
        },
        {
          id: 'b2',
          name: 'Dining Out',
          limit: 200,
          category: 'Restaurant',
          period: 'monthly',
          spent: 180,
          alerts: true
        }
      ]
      setBudgets(demo)
      localStorage.setItem('budgets_demo', JSON.stringify(demo))
    }

    // Load transactions
    const savedTx = localStorage.getItem('transactions_demo')
    if (savedTx) {
      try { setTransactions(JSON.parse(savedTx)) } catch (e) { setTransactions([]) }
    }
  }, [])

  const calculateSpent = (budget) => {
    return transactions
      .filter(tx => tx.type === 'expense' && tx.category === budget.category)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0)
  }

  const handleCreateBudget = (e) => {
    e.preventDefault()
    const newBudget = {
      id: 'b_' + Date.now(),
      name: formData.name,
      limit: parseFloat(formData.limit),
      category: formData.category,
      period: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate,
      spent: 0,
      alerts: false
    }
    const updated = [...budgets, newBudget]
    setBudgets(updated)
    localStorage.setItem('budgets_demo', JSON.stringify(updated))
    setShowModal(false)
    setFormData({
      name: '',
      limit: '',
      category: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    })
  }

  const deleteBudget = (id) => {
    const updated = budgets.filter(b => b.id !== id)
    setBudgets(updated)
    localStorage.setItem('budgets_demo', JSON.stringify(updated))
  }

  return (
    <div>
      <div className="page-header">
        <h2>Budget Tracking</h2>
        <p>Set and monitor spending budgets across categories</p>
      </div>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        ➕ Create Budget
      </button>

      <div style={{ marginTop: '30px' }}>
        {budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No budgets yet</h3>
            <p>Create a budget to track your spending</p>
          </div>
        ) : (
          budgets.map(budget => {
            const spent = calculateSpent(budget)
            const remaining = budget.limit - spent
            const percentage = (spent / budget.limit) * 100
            const isAlert = percentage >= 80

            return (
              <div key={budget.id} className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                  <span className="card-title">{budget.name}</span>
                  <span className="card-icon">🎯</span>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>{budget.category}</span>
                    <span style={{ fontWeight: 600 }}>
                      ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#ecf0f1',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: isAlert ? '#e74c3c' : '#27ae60',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#7f8c8d' }}>
                    <span>{percentage.toFixed(0)}% spent</span>
                    <span style={{ color: remaining >= 0 ? '#27ae60' : '#e74c3c' }}>
                      ${remaining.toFixed(2)} remaining
                    </span>
                  </div>
                </div>

                {isAlert && (
                  <div style={{
                    backgroundColor: '#fadbd8',
                    color: '#c0392b',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    ⚠️ Budget Alert: You've spent {percentage.toFixed(0)}% of your {budget.category} budget!
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#95a5a6', marginBottom: '12px' }}>
                  {budget.period === 'monthly' && <span>📅 Monthly budget</span>}
                  {budget.period === 'yearly' && <span>📅 Yearly budget</span>}
                </div>

                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => deleteBudget(budget.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Budget</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateBudget}>
              <div className="form-group">
                <label>Budget Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Monthly Groceries"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="e.g., Groceries, Dining, Transport"
                />
              </div>

              <div className="form-group">
                <label>Spending Limit</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Period</label>
                <select
                  className="form-control"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              {formData.period === 'custom' && (
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Budget</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
