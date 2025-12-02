/**
 * App.jsx - Root component của React app
 *
 * Chức năng:
 * - Quản lý navigation giữa các trang bằng React Router
 * - Render Sidebar (fixed) + Main content (thay đổi theo route)
 * - Quản lý state isOpen của sidebar để main content responsive
 *
 * React Router:
 * - Sử dụng <BrowserRouter>, <Routes>, <Route>
 * - URL sẽ thay đổi theo trang (/dashboard, /transactions, etc.)
 * - State được preserve khi navigate
 */
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
//import Chatbot from './components/Chatbot'
//import UserInfo from './components/UserInfo'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Accounts from './pages/Accounts'
import Budget from './pages/Budget'
import SavingGoals from './pages/SavingGoals'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
export default function App({ initialPage, initialOobCode }){
  // allow main to pass an initial page (e.g. 'reset') and oobCode for password reset flows
  const [currentPage, setCurrentPage] = useState(initialPage || 'dashboard')
  const [user, setUser] = useState(null)
  const [oobCode] = useState(initialOobCode || null)

  const renderPage = () => {
    switch(currentPage){
      case 'dashboard': return <Dashboard />
      case 'transactions': return <Transactions />
      case 'budget': return <Budget />
      case 'saving-goals': return <SavingGoals />
      case 'categories': return <Categories />
      case 'reports': return <Reports />
      case 'accounts': return <Accounts />
      case 'login': return <Login onLogin={(u) => { setUser(u); setCurrentPage('dashboard') }} onNavigate={(p) => setCurrentPage(p)} />
      case 'register': return <Register onRegister={(u) => { setUser(u); setCurrentPage('dashboard') }} onNavigate={(p) => setCurrentPage(p)} />
      case 'reset': return <ResetPassword oobCode={oobCode} onNavigate={(p) => setCurrentPage(p)} />
      default: return <Dashboard />
    }
  }

  useEffect(() => {
    if (!user && currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'reset') {
      setCurrentPage('login')
    }
  }, [user, currentPage])

  return (
    <div className="app">
      {user && <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={() => { setUser(null); setCurrentPage('login') }} />}

      <main className="main-content">
        {renderPage()}
      </main>

      {user && <Chatbot />}
    </div>
  )
}
