import React, {useState} from 'react'

const mockCategories = [
  { id: 1, name: 'Salary', type: 'income', color: '#27ae60', icon: '💼' },
  { id: 2, name: 'Freelance', type: 'income', color: '#3498db', icon: '💻' },
  { id: 3, name: 'Investment', type: 'income', color: '#9b59b6', icon: '📈' },
  { id: 4, name: 'Groceries', type: 'expense', color: '#e74c3c', icon: '🛒' },
  { id: 5, name: 'Restaurant', type: 'expense', color: '#e67e22', icon: '🍽️' },
  { id: 6, name: 'Transportation', type: 'expense', color: '#f39c12', icon: '🚗' },
  { id: 7, name: 'Shopping', type: 'expense', color: '#c0392b', icon: '🛍️' },
  { id: 8, name: 'Utilities', type: 'expense', color: '#34495e', icon: '💡' },
]

export default function Categories() {
  const [categories, setCategories] = useState(mockCategories)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: '📁',
    color: '#3498db'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newCategory = {
      id: Date.now(),
      ...formData
    }
    setCategories([...categories, newCategory])
    setShowModal(false)
    setFormData({ name: '', type: 'expense', icon: '📁', color: '#3498db' })
  }

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id))
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Categories</h2>
        <p className="text-gray-600">Organize your transactions</p>
      </div>

      <button 
        className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors mb-6"
        onClick={() => setShowModal(true)}
      >
        ➕ Add Category
      </button>

      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Income Categories ({incomeCategories.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {incomeCategories.map(cat => (
            <div key={cat.id} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                style={{backgroundColor: cat.color + '20', color: cat.color}}
              >
                {cat.icon}
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{cat.name}</h4>
              <span className="inline-block px-3 py-1 bg-green-100 text-success rounded-full text-sm font-medium mb-3">
                Income
              </span>
              <button 
                className="w-full bg-danger text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                onClick={() => handleDelete(cat.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Categories ({expenseCategories.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {expenseCategories.map(cat => (
            <div key={cat.id} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                style={{backgroundColor: cat.color + '20', color: cat.color}}
              >
                {cat.icon}
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{cat.name}</h4>
              <span className="inline-block px-3 py-1 bg-red-100 text-danger rounded-full text-sm font-medium mb-3">
                Expense
              </span>
              <button 
                className="w-full bg-danger text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                onClick={() => handleDelete(cat.id)}
              >
                Delete
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
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.type === 'income'
                      ? 'bg-success text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFormData({...formData, type: 'income'})}
                >
                  💰 Income
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.type === 'expense'
                      ? 'bg-danger text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFormData({...formData, type: 'expense'})}
                >
                  💸 Expense
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Food, Rent, Bonus"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="🎯"
                  maxLength="2"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  className="w-full h-12 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
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
