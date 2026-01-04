import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Target, Calendar, CheckCircle, Trash2, DollarSign } from 'lucide-react'
import { savingGoalAPI } from '../api.js'
import Chatbot from '../components/chatbot/Chatbot.jsx'

export default function SavingGoals() {
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const response = await savingGoalAPI.getAll()
      // response is { success: true, data: [...] }
      setGoals(Array.isArray(response) ? response : response.data || [])
    } catch (err) {
      console.error('Failed to load saving goals:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load saving goals')
    } finally {
      setLoading(false)
    }
  }

  const onCreateGoal = async (data) => {
    try {
      setError(null)
      const goalData = {
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount) || 0,
        deadline: data.deadline,
        description: data.description,
        priority: 'medium'
      }

      const response = await savingGoalAPI.create(goalData)
      // Response is { success: true, data: goal }
      const newGoal = response.data || response
      setGoals([newGoal, ...goals])
      setShowModal(false)
      reset()
    } catch (err) {
      console.error('Failed to create goal:', err)
      setError(err.response?.data?.error || err.message || 'Failed to create goal')
    }
  }

  const addContribution = async (id, amount) => {
    try {
      const response = await savingGoalAPI.addContribution(id, {
        amount: parseFloat(amount),
        note: 'Contribution'
      })
      // Controller returns { message, goal, transaction }
      if (response && response.goal) {
        setGoals(goals.map(g => g._id === id || g.id === id ? response.goal : g))
      }
    } catch (err) {
      console.error('Failed to add contribution:', err)
      setError(err.response?.data?.error || err.message || 'Failed to add contribution')
    }
  }

  const deleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this saving goal?')) return
    try {
      await savingGoalAPI.delete(id)
      setGoals(goals.filter(g => g._id !== id && g.id !== id))
    } catch (err) {
      console.error('Failed to delete goal:', err)
      setError(err.response?.data?.error || err.message || 'Failed to delete goal')
    }
  }

  const daysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-teal-500 border-b-transparent border-l-transparent animate-spin"></div>

            {/* Inner pulsing target icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="w-10 h-10 text-green-500 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Saving Goals</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>

          {/* Loading dots animation */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-1 text-gray-800">Saving Goals</h2>
        <p className="text-gray-600">Create and track your financial goals</p>
      </div>

      <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
        onClick={() => setShowModal(true)}>
        <Plus className="w-5 h-5" /> Create Goal
      </button>

      <div className="mt-8 space-y-6">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <Target className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-semibold mb-1">No saving goals yet</h3>
            <p>Create a saving goal to start tracking your progress</p>
          </div>
        ) : goals.map(goal => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100
          const daysLeft = daysRemaining(goal.deadline)
          const isCompleted = goal.currentAmount >= goal.targetAmount

          return (
            <div key={goal.id} className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 p-6 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-800">{goal.name}</span>
                <Target className="w-8 h-8 text-green-600 animate-bounce" />
              </div>

              {goal.description && <div className="text-sm text-gray-600 mb-4 italic">{goal.description}</div>}

              <div className="mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="font-bold text-gray-800">${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-700 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
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
                <span className={`px-3 py-1 rounded-full font-semibold ${daysLeft === 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {daysLeft === 0 ? 'Expired' : daysLeft + ' days left'}
                </span>
              </div>

              {isCompleted && (
                <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-4 py-3 rounded-lg mb-3 text-sm font-bold border border-green-300 animate-pulse flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Goal completed!
                </div>
              )}

              <div className="flex gap-2 mb-3">
                <input type="number" id={`contribution-${goal.id}`} placeholder="Add contribution amount"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    const input = document.getElementById(`contribution-${goal.id}`)
                    if (input.value) { addContribution(goal.id, input.value); input.value = ''; }
                  }}>Add</button>
              </div>

              <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                onClick={() => deleteGoal(goal.id)}>
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Create Saving Goal</h3>
            <form onSubmit={handleSubmit(onCreateGoal)} className="space-y-4">
              <input type="text" placeholder="Goal Name" {...register('name', { required: true })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
              {errors.name && <p className="text-red-500 text-sm">Goal name required</p>}
              <input type="number" placeholder="Target Amount" {...register('targetAmount', { required: true, min: 0.01 })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
              {errors.targetAmount && <p className="text-red-500 text-sm">Target amount required</p>}
              <input type="number" placeholder="Current Amount" {...register('currentAmount', { min: 0 })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="date" {...register('deadline', { required: true })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
              <textarea placeholder="Description" {...register('description')} rows={3} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Create</button>
                <button type="button" onClick={() => { setShowModal(false); reset(); }} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
