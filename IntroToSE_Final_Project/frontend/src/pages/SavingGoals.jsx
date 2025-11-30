import React, { useState, useEffect } from 'react'

export default function SavingGoals() {
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('saving_goals_demo')
    if (saved) {
      try { setGoals(JSON.parse(saved)) } catch (e) { setGoals([]) }
    } else {
      const demo = [
        {
          id: 'sg1',
          name: 'Vacation Fund',
          targetAmount: 2000,
          currentAmount: 800,
          deadline: '2025-12-31',
          description: 'Summer vacation to Europe',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sg2',
          name: 'Emergency Fund',
          targetAmount: 5000,
          currentAmount: 3200,
          deadline: '2026-06-30',
          description: 'Emergency savings for unexpected expenses',
          createdAt: new Date().toISOString()
        }
      ]
      setGoals(demo)
      localStorage.setItem('saving_goals_demo', JSON.stringify(demo))
    }
  }, [])

  const handleCreateGoal = (e) => {
    e.preventDefault()
    const newGoal = {
      id: 'sg_' + Date.now(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      description: formData.description,
      createdAt: new Date().toISOString()
    }
    const updated = [...goals, newGoal]
    setGoals(updated)
    localStorage.setItem('saving_goals_demo', JSON.stringify(updated))
    setShowModal(false)
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      description: ''
    })
  }

  const updateGoalAmount = (id, amount) => {
    const updated = goals.map(g =>
      g.id === id ? { ...g, currentAmount: amount } : g
    )
    setGoals(updated)
    localStorage.setItem('saving_goals_demo', JSON.stringify(updated))
  }

  const addContribution = (id, amount) => {
    const goal = goals.find(g => g.id === id)
    if (goal) {
      updateGoalAmount(id, Math.min(goal.currentAmount + parseFloat(amount), goal.targetAmount))
    }
  }

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    localStorage.setItem('saving_goals_demo', JSON.stringify(updated))
  }

  const daysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div>
      <div className="page-header">
        <h2>Saving Goals</h2>
        <p>Create and track your financial goals</p>
      </div>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        ➕ Create Saving Goal
      </button>

      <div style={{ marginTop: '30px' }}>
        {goals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3>No saving goals yet</h3>
            <p>Create a saving goal to start tracking your progress</p>
          </div>
        ) : (
          goals.map(goal => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100
            const daysLeft = daysRemaining(goal.deadline)
            const isCompleted = goal.currentAmount >= goal.targetAmount

            return (
              <div key={goal.id} className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                  <span className="card-title">{goal.name}</span>
                  <span className="card-icon">🎯</span>
                </div>

                {goal.description && (
                  <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '12px' }}>
                    {goal.description}
                  </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 600 }}>
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: '#ecf0f1',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: isCompleted ? '#27ae60' : '#3498db',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#7f8c8d' }}>
                    <span>{percentage.toFixed(0)}% completed</span>
                    <span>${(goal.targetAmount - goal.currentAmount).toFixed(2)} to go</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '12px' }}>
                  <span>📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  <span style={{ color: daysLeft === 0 ? '#e74c3c' : '#7f8c8d' }}>
                    ({daysLeft === 0 ? 'Expired' : daysLeft + ' days left'})
                  </span>
                </div>

                {isCompleted && (
                  <div style={{
                    backgroundColor: '#d5f4e6',
                    color: '#27ae60',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    ✅ Goal completed! You've reached your target!
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Add contribution amount"
                    step="0.01"
                    min="0"
                    id={`contribution-${goal.id}`}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      const input = document.getElementById(`contribution-${goal.id}`)
                      if (input.value) {
                        addContribution(goal.id, input.value)
                        input.value = ''
                      }
                    }}
                    style={{ padding: '10px 16px' }}
                  >
                    Add
                  </button>
                </div>

                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => deleteGoal(goal.id)}
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
              <h3>Create Saving Goal</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Vacation Fund, Emergency Fund"
                />
              </div>

              <div className="form-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Current Amount (optional)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="What is this goal for?"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Goal</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
