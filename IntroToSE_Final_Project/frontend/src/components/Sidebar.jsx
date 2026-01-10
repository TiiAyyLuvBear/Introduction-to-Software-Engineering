import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  // { to: '/profile', label: 'Profile', icon: 'person' },
  { to: '/transactions', label: 'Transactions', icon: 'receipt_long' },
  { to: '/wallets', label: 'Wallets', icon: 'account_balance_wallet' },
  { to: '/savings', label: 'Savings', icon: 'savings' },
  { to: '/budgets', label: 'Budgets', icon: 'pie_chart' },
  { to: '/categories', label: 'Categories', icon: 'list' },
  { to: '/reports', label: 'Reports', icon: 'bar_chart' },
  { to: '/accounts', label: 'Accounts', icon: 'account_balance' },
  { to: '/about', label: 'About us', icon: 'info' },
]

export default function Sidebar({ onLogout }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border-dark bg-background-dark md:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-border-dark px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            <div>
              <div className="text-base font-bold text-white">4Money</div>
              <div className="text-xs font-medium text-text-secondary">Introduction to Software Engineering</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ` +
                (isActive
                  ? 'nav-active bg-primary/10 text-primary font-bold'
                  : 'text-text-secondary hover:bg-border-dark hover:text-white font-medium')
              }
            >
              <span className="material-symbols-outlined text-[20px]">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-dark p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-background-dark hover:bg-[#15c54e]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}
