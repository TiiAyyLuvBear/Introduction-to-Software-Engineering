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
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Chatbot from "./components/chatbot/Chatbot";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Abouts from "./pages/Abouts";
import Wallets from "./pages/Wallets";
import SavingGoals from "./pages/SavingGoals";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import Authentication from "./pages/Authenication";
import "./App.css";

export default function App() {
  // State để quản lý mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Route - Authentication */}
          <Route path="/login" element={<Authentication />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  {/* Horizontal Navbar - Fixed top */}
                  <Sidebar
                    isOpen={isMobileMenuOpen}
                    setIsOpen={setIsMobileMenuOpen}
                  />

                  {/* Main content area - Add top padding for fixed navbar */}
                  <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8 max-w-screen-2xl mx-auto">
                    <Routes>
                      {/* Redirect root "/" về "/dashboard" */}
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />

                      {/* Các trang chính */}
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/wallets" element={<Wallets />} />
                      <Route path="/accounts" element={<Accounts />} />
                      <Route path="/abouts" element={<Abouts />} />
                      <Route path="/savings" element={<SavingGoals />} />
                      <Route path="/budgets" element={<Budget />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </main>
                  <Chatbot />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
