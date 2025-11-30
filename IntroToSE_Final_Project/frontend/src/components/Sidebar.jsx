import React from 'react'

export default function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'budget', label: 'Budget', icon: '🎯' },
    { id: 'saving-goals', label: 'Saving Goals', icon: '🏆' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'accounts', label: 'Accounts', icon: '🏦' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>💸 Money Lover</h1>
        <p>Personal Finance Manager</p>
      </div>
      <ul className="nav-menu">
        {menuItems.map(item => (
          <li
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}

        {!user && (
          <>
            <li
              className={`nav-item ${currentPage === 'login' ? 'active' : ''}`}
              onClick={() => onNavigate('login')}
            >
              <span className="nav-icon">🔑</span>
              <span>Login</span>
            </li>
            <li
              className={`nav-item ${currentPage === 'register' ? 'active' : ''}`}
              onClick={() => onNavigate('register')}
            >
              <span className="nav-icon">📝</span>
              <span>Register</span>
            </li>
          </>
        )}
      </ul>

      <div style={{ padding: '20px' }}>
        {user ? (
          <div className="nav-item" style={{ cursor: 'pointer' }} onClick={onLogout}>
            <span className="nav-icon">🔓</span>
            <span>Logout</span>
          </div>
        ) : (
          <div style={{ color: '#95a5a6', fontSize: 13 }}>
            <div>Not signed in</div>
          </div>
        )}
      </div>
    </aside>
  )
}
