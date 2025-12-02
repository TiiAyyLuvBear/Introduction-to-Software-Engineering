import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, FolderOpen, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { categoryAPI } from '../api.js'
import Chatbot from '../components/chatbot/Chatbot.jsx'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '📁',
      color: '#3498db'
    }
  })

  const currentType = watch('type')

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryAPI.getAll()
      if (response.success) {
        setCategories(response.data.categories || [])
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setError(null)
      const categoryData = {
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color
      }

      const response = await categoryAPI.create(categoryData)
      if (response.success) {
        setCategories([...categories, response.data.category])
      }
      setShowModal(false)
      reset()
    } catch (err) {
      console.error('Failed to create category:', err)
      setError(err.response?.data?.error || err.message || 'Failed to create category')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await categoryAPI.delete(id)
      setCategories(categories.filter(c => c._id !== id && c.id !== id))
    } catch (err) {
      console.error('Failed to delete category:', err)
      setError(err.response?.data?.error || err.message || 'Failed to delete category')
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Inner pulsing folder icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Categories</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Categories</h2>
        <p className="text-gray-600">Organize your transactions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
          {error}
        </div>
      )}

      <button 
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300 mb-6 flex items-center gap-2"
        onClick={() => setShowModal(true)}
      >
        <Plus className="w-5 h-5" /> Add Category
      </button>

      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Income Categories ({incomeCategories.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {incomeCategories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl shadow-md hover:shadow-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:rotate-12"
                style={{backgroundColor: cat.color + '20', color: cat.color}}
              >
                {cat.icon}
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">{cat.name}</h4>
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-sm font-semibold mb-3">
                Income
              </span>
              <button 
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Categories ({expenseCategories.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {expenseCategories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl shadow-md hover:shadow-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:rotate-12"
                style={{backgroundColor: cat.color + '20', color: cat.color}}
              >
                {cat.icon}
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">{cat.name}</h4>
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-full text-sm font-semibold mb-3">
                Expense
              </span>
              <button 
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add Category</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    currentType === 'income'
                      ? 'bg-success text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setValue('type', 'income')}
                >
                  <TrendingUp className="w-5 h-5" /> Income
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    currentType === 'expense'
                      ? 'bg-danger text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setValue('type', 'expense')}
                >
                  <TrendingDown className="w-5 h-5" /> Expense
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('name', { 
                    required: 'Category name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  placeholder="e.g., Food, Rent, Bonus"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('icon', { maxLength: 2 })}
                  placeholder="🎯"
                  maxLength="2"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  className="w-full h-12 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('color')}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Save Category
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={() => { setShowModal(false); reset(); }}
                >
                  Cancel
                </button>
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
