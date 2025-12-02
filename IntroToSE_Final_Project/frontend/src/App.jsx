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
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
import UserInfo from './components/UserInfo'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Accounts from './pages/Accounts'
import Abouts from './pages/Abouts'
import Authentication from './pages/Authenication'
import GroupWallet from './pages/GroupWallet'
import Wallets from './pages/Wallets'
import Invitations from './pages/Invitations'

export default function App() {
  // State để quản lý sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar - Fixed left với toggle button */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Main content area - Tự động full width khi sidebar đóng */}
        <main 
          className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${
            isSidebarOpen ? 'lg:pl-72' : 'pl-20'
          }`}
        >
          <Routes>
            {/* Redirect root "/" về "/dashboard" */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Các routes cho từng trang */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/abouts" element={<Abouts />} />
            <Route path="/authenication" element={<Authentication />}/>
            <Route path="/userinfo" element={<UserInfo />}/>
          </Routes>
        </main>
      </div>
    </Router>
  )
}
