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
    <div>
      <div className="page-header">
        <h2>Categories</h2>
        <p>Organize your transactions</p>
      </div>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        ➕ Add Category
      </button>

      <div style={{marginTop: '30px'}}>
        <h3 style={{marginBottom: '15px'}}>Income Categories ({incomeCategories.length})</h3>
        <div className="category-grid">
          {incomeCategories.map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-card-icon" style={{backgroundColor: cat.color + '20', color: cat.color}}>
                {cat.icon}
              </div>
              <h4>{cat.name}</h4>
              <span className="badge income">Income</span>
              <button 
                className="btn btn-danger" 
                style={{marginTop: '12px', padding: '6px 12px', fontSize: '12px'}}
                onClick={() => handleDelete(cat.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop: '40px'}}>
        <h3 style={{marginBottom: '15px'}}>Expense Categories ({expenseCategories.length})</h3>
        <div className="category-grid">
          {expenseCategories.map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-card-icon" style={{backgroundColor: cat.color + '20', color: cat.color}}>
                {cat.icon}
              </div>
              <h4>{cat.name}</h4>
              <span className="badge expense">Expense</span>
              <button 
                className="btn btn-danger" 
                style={{marginTop: '12px', padding: '6px 12px', fontSize: '12px'}}
                onClick={() => handleDelete(cat.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Category</h3>
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
                <label>Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Food, Rent, Bonus"
                />
              </div>

              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="🎯"
                  maxLength="2"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  className="form-control"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Category</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
