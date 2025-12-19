/**
 * App.jsx - Root component của React app
 *
 * Chức năng:
 * - Quản lý navigation giữa các trang bằng React Router
 * - Wrap app với AuthProvider để quản lý authentication state
 * - Protected routes: chỉ cho phép access khi đã login
 */
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Authentication from './pages/Authenication'
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
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }
  
  return children
}

// Main App Layout
function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { currentUser } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Chỉ hiện khi authenticated */}
      {currentUser && <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />}
      
      {/* Main content area */}
      <main className={currentUser ? "pt-20 px-4 sm:px-6 lg:px-8 pb-8 max-w-screen-2xl mx-auto" : ""}>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Authentication />} />
          
          {/* Backward compatibility redirects */}
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />
          
          {/* Redirect root "/" */}
          <Route path="/" element={
            currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
          } />
          
          {/* Protected Routes */}
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
  )
}

// Root App Component
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  )
}
