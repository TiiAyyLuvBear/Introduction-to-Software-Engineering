import React from 'react'

export default function Sidebar({ currentPage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'categories', label: 'Categories', icon: '📁' },
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
      </ul>
    </aside>
  )
}
