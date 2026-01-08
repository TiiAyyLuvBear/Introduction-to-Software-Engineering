import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { ToastProvider } from './components/Toast.jsx'

// Auth module
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'

// Standalone pages
import Dashboard from './pages/Dashboard.jsx'
import About from './pages/About.jsx'

// Transactions module
import Transactions from './pages/transactions/index.jsx'

// Categories module
import Categories from './pages/categories/index.jsx'
import AddCategory from './pages/categories/AddCategory.jsx'

// Wallets module
import Wallets from './pages/wallets/index.jsx'
import Accounts from './pages/accounts/index.jsx'
import CreateWallet from './pages/wallets/CreateWallet.jsx'

// Savings module
import Savings from './pages/savings/index.jsx'
import CreateGoal from './pages/savings/CreateGoal.jsx'

// Budgets module
import Budgets from './pages/budgets/index.jsx'
import CreateBudget from './pages/budgets/CreateBudget.jsx'

// Reports module
import Reports from './pages/reports/index.jsx'
import ReportByCategory from './pages/reports/ReportByCategory.jsx'
import ReportByWallet from './pages/reports/ReportByWallet.jsx'

import Sidebar from './components/Sidebar.jsx'

import tokenResolver from './services/tokenResolver.js'

function getUser() {
  // Get user from localStorage
  try {
    const userStr = localStorage.getItem('ml_user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = React.useState(getUser)

  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password'

  React.useEffect(() => {
    if (!user && !isAuthRoute) navigate('/login', { replace: true })
    if (user && isAuthRoute) navigate('/', { replace: true })
  }, [user, isAuthRoute, navigate])

  const onLogin = (u) => {
    // Accept either (a) just a user object, or (b) { user, accessToken, refreshToken }
    if (u && u.user && (u.accessToken || u.refreshToken)) {
      // Save tokens using tokenResolver
      tokenResolver.setTokens(u.accessToken, u.refreshToken)
      // Save user to localStorage
      localStorage.setItem('ml_user', JSON.stringify(u.user))
      setUser(u.user)
      return
    }
    // Fallback: just save user
    localStorage.setItem('ml_user', JSON.stringify(u))
    setUser(u)
  }

  const onLogout = () => {
    // Clear tokens using tokenResolver
    tokenResolver.removeTokens()
    // Clear user from localStorage
    localStorage.removeItem('ml_user')
    setUser(null)
    navigate('/login', { replace: true })
  }

  if (!user && !isAuthRoute) return null

  return (
    <div className="min-h-screen bg-background-dark text-white font-display">
      {user && <Sidebar onLogout={onLogout} />}

      <div className={user ? 'md:pl-72' : ''}>
        <Routes>
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/register" element={<Register onLogin={onLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/category" element={<ReportByCategory />} />
          <Route path="/reports/wallet" element={<ReportByWallet />} />
          <Route path="/about" element={<About />} />

          <Route path="/categories/new" element={<AddCategory />} />
          <Route path="/wallets/new" element={<CreateWallet />} />
          <Route path="/savings/new" element={<CreateGoal />} />
          <Route path="/budgets/new" element={<CreateBudget />} />

          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  )
}
