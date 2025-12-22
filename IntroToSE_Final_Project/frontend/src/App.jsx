/**
 * App.jsx - Root component của React app
 *
 * Chức năng:
 * - Quản lý navigation giữa các trang bằng React Router
 * - Render Sidebar (fixed) + Main content (thay đổi theo route)
 * - Quản lý state isOpen của sidebar để main content responsive
 * - Protected routes: chỉ hiện sidebar & pages khi đã login
 *
 * React Router:
 * - Sử dụng <BrowserRouter>, <Routes>, <Route>
 * - URL sẽ thay đổi theo trang (/dashboard, /transactions, etc.)
 * - State được preserve khi navigate
 */
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Accounts from './pages/Accounts'
import Abouts from './pages/Abouts'
import Wallets from './pages/Wallets'
import SavingGoals from './pages/SavingGoals'
import Budget from './pages/Budget'
import Reports from './pages/Reports'
import UserInfo from './components/user/UserInfo'
import './App.css'

<<<<<<< Updated upstream
// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
=======
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

import { clearSession, getStoredUser, setSession } from './lib/api.js'

function getUser() {
  return getStoredUser()
>>>>>>> Stashed changes
}

export default function App() {
  // State để quản lý mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  )

<<<<<<< Updated upstream
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true')
=======
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
      setSession(u)
      setUser(u.user)
      return
>>>>>>> Stashed changes
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
<<<<<<< Updated upstream
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Horizontal Navbar - Chỉ hiện khi authenticated */}
        {isAuthenticated && <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />}
        
        {/* Main content area - Add top padding for fixed navbar chỉ khi authenticated */}
        <main className={isAuthenticated ? "pt-20 px-4 sm:px-6 lg:px-8 pb-8 max-w-screen-2xl mx-auto" : ""}>
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root "/" về "/login" nếu chưa auth, "/dashboard" nếu đã auth */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } />
            
            {/* Protected Routes - chỉ truy cập được khi authenticated */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute><Transactions /></ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute><Categories /></ProtectedRoute>
            } />
            <Route path="/wallets" element={
              <ProtectedRoute><Wallets /></ProtectedRoute>
            } />
            <Route path="/accounts" element={
              <ProtectedRoute><Accounts /></ProtectedRoute>
            } />
            <Route path="/abouts" element={
              <ProtectedRoute><Abouts /></ProtectedRoute>
            } />
            <Route path="/savings" element={
              <ProtectedRoute><SavingGoals /></ProtectedRoute>
            } />
            <Route path="/budgets" element={
              <ProtectedRoute><Budget /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute><Reports /></ProtectedRoute>
            } />
          </Routes>
        </main>
=======
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
>>>>>>> Stashed changes
      </div>
    </Router>
  )
}
