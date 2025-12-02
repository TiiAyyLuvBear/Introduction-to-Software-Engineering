import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Target, AlertTriangle, Calendar, Trash2 } from 'lucide-react'

export default function Budget() {
  const [budgets, setBudgets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      limit: '',
      category: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    }
  })
  
  const watchPeriod = watch('period')

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

  const onCreateBudget = (data) => {
    const newBudget = {
      id: 'b_' + Date.now(),
      name: data.name,
      limit: parseFloat(data.limit),
      category: data.category,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      spent: 0,
      alerts: false
    }
    const updated = [...budgets, newBudget]
    setBudgets(updated)
    localStorage.setItem('budgets_demo', JSON.stringify(updated))
    setShowModal(false)
    reset()
  }

  const deleteBudget = (id) => {
    const updated = budgets.filter(b => b.id !== id)
    setBudgets(updated)
    localStorage.setItem('budgets_demo', JSON.stringify(updated))
  }

  return (
    <div>
      <div className="page-header mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Budget Tracking</h2>
        <p className="text-gray-600">Set and monitor spending budgets across categories</p>
      </div>

      <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2" onClick={() => setShowModal(true)}>
        <Plus className="w-5 h-5" /> Create Budget
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
              <div key={budget.id} className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 mb-6 border border-purple-100 transform hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-800">{budget.name}</span>
                  <Target className="w-8 h-8 text-purple-600 animate-pulse" />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600 font-medium">{budget.category}</span>
                    <span className="font-bold text-gray-800">
                      ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isAlert ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-500 font-medium">{percentage.toFixed(0)}% spent</span>
                    <span className={`font-bold ${
                      remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${remaining.toFixed(2)} remaining
                    </span>
                  </div>
                </div>

                {isAlert && (
                  <div className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm font-semibold border border-red-300 animate-pulse flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Budget Alert: You've spent {percentage.toFixed(0)}% of your {budget.category} budget!
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3 font-medium">
                  {budget.period === 'monthly' && <span className="bg-blue-100 px-3 py-1 rounded-full inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Monthly budget</span>}
                  {budget.period === 'yearly' && <span className="bg-purple-100 px-3 py-1 rounded-full inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Yearly budget</span>}
                </div>

                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  onClick={() => deleteBudget(budget.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
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
            <form onSubmit={handleSubmit(onCreateBudget)}>
              <div className="form-group">
                <label>Budget Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                  {...register('name', { required: 'Budget name is required' })}
                  placeholder="e.g., Monthly Groceries"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className={`form-control ${errors.category ? 'border-red-500' : ''}`}
                  {...register('category', { required: 'Category is required' })}
                  placeholder="e.g., Groceries, Dining, Transport"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div className="form-group">
                <label>Spending Limit</label>
                <input
                  type="number"
                  className={`form-control ${errors.limit ? 'border-red-500' : ''}`}
                  {...register('limit', { 
                    required: 'Spending limit is required',
                    min: { value: 0.01, message: 'Limit must be greater than 0' }
                  })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.limit && <p className="text-red-500 text-sm mt-1">{errors.limit.message}</p>}
              </div>

              <div className="form-group">
                <label>Period</label>
                <select className="form-control" {...register('period')}>
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
                  {...register('startDate')}
                />
              </div>

              {watchPeriod === 'custom' && (
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    className={`form-control ${errors.endDate ? 'border-red-500' : ''}`}
                    {...register('endDate', {
                      required: watchPeriod === 'custom' ? 'End date is required for custom period' : false
                    })}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Budget</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
