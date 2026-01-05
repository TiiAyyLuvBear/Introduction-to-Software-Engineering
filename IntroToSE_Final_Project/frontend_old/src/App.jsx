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

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default function App() {
  // State để quản lý mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  )

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
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
      </div>
    </Router>
  )
}
