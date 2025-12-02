import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Target, Calendar, CheckCircle, Trash2, DollarSign } from 'lucide-react'

export default function SavingGoals() {
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      description: ''
    }
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

  const onCreateGoal = (data) => {
    const newGoal = {
      id: 'sg_' + Date.now(),
      name: data.name,
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: parseFloat(data.currentAmount) || 0,
      deadline: data.deadline,
      description: data.description,
      createdAt: new Date().toISOString()
    }
    const updated = [...goals, newGoal]
    setGoals(updated)
    localStorage.setItem('saving_goals_demo', JSON.stringify(updated))
    setShowModal(false)
    reset()
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Saving Goals</h2>
        <p className="text-gray-600">Create and track your financial goals</p>
      </div>

      <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2" onClick={() => setShowModal(true)}>
        <Plus className="w-5 h-5" /> Create Saving Goal
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
              <div key={goal.id} className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 mb-6 border border-green-100 transform hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-800">{goal.name}</span>
                  <Target className="w-8 h-8 text-green-600 animate-bounce" />
                </div>

                {goal.description && (
                  <div className="text-sm text-gray-600 mb-4 italic">
                    {goal.description}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600 font-medium">Progress</span>
                    <span className="font-bold text-gray-800">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span className="font-medium">{percentage.toFixed(0)}% completed</span>
                    <span className="font-bold">${(goal.targetAmount - goal.currentAmount).toFixed(2)} to go</span>
                  </div>
                </div>

                <div className="flex gap-3 mb-3 text-xs">
                  <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString()}</span>
                  <span className={`px-3 py-1 rounded-full font-semibold ${
                    daysLeft === 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {daysLeft === 0 ? 'Expired' : daysLeft + ' days left'}
                  </span>
                </div>

                {isCompleted && (
                  <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-4 py-3 rounded-lg mb-3 text-sm font-bold border border-green-300 animate-pulse flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Goal completed! You've reached your target!
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Add contribution amount"
                    step="0.01"
                    min="0"
                    id={`contribution-${goal.id}`}
                  />
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 hover:shadow-lg transition-all duration-300"
                    onClick={() => {
                      const input = document.getElementById(`contribution-${goal.id}`)
                      if (input.value) {
                        addContribution(goal.id, input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </button>
                </div>

                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  onClick={() => deleteGoal(goal.id)}
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
              <h3>Create Saving Goal</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit(onCreateGoal)}>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                  {...register('name', { required: 'Goal name is required' })}
                  placeholder="e.g., Vacation Fund, Emergency Fund"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  className={`form-control ${errors.targetAmount ? 'border-red-500' : ''}`}
                  {...register('targetAmount', { 
                    required: 'Target amount is required',
                    min: { value: 0.01, message: 'Target must be greater than 0' }
                  })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount.message}</p>}
              </div>

              <div className="form-group">
                <label>Current Amount (optional)</label>
                <input
                  type="number"
                  className={`form-control ${errors.currentAmount ? 'border-red-500' : ''}`}
                  {...register('currentAmount', {
                    min: { value: 0, message: 'Amount cannot be negative' }
                  })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.currentAmount && <p className="text-red-500 text-sm mt-1">{errors.currentAmount.message}</p>}
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  className={`form-control ${errors.deadline ? 'border-red-500' : ''}`}
                  {...register('deadline', { 
                    required: 'Deadline is required',
                    validate: (value) => {
                      const selectedDate = new Date(value)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return selectedDate >= today || 'Deadline must be today or in the future'
                    }
                  })}
                />
                {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>}
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  className="form-control"
                  {...register('description')}
                  rows="3"
                  placeholder="What is this goal for?"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Goal</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
