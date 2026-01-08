import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { ToastProvider } from './components/Toast.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Profile from './pages/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Categories from './pages/Categories.jsx'
import Wallets from './pages/Wallets.jsx'
import Accounts from './pages/Accounts.jsx'
import Savings from './pages/Savings.jsx'
import Budgets from './pages/Budgets.jsx'
import Reports from './pages/Reports.jsx'
import ReportByCategory from './pages/ReportByCategory.jsx'
import ReportByWallet from './pages/ReportByWallet.jsx'
import About from './pages/About.jsx'

import AddTransaction from './pages/AddTransaction.jsx'
import EditTransaction from './pages/EditTransaction.jsx'
import TransferMoney from './pages/TransferMoney.jsx'
import AddCategory from './pages/AddCategory.jsx'
import CreateWallet from './pages/CreateWallet.jsx'
import CreateGoal from './pages/CreateGoal.jsx'
import CreateBudget from './pages/CreateBudget.jsx'

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />

          <Route path="/transactions/add" element={<AddTransaction />} />
          <Route path="/transactions/:id/edit" element={<EditTransaction />} />
          <Route path="/transactions/transfer" element={<TransferMoney />} />
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
