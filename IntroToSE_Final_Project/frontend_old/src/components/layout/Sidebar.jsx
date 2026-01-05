import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyBillWave,
  FaFolderOpen,
  FaWallet,
  FaUniversity,
  FaPiggyBank,
  FaCalendarAlt,
  FaChartLine,
  FaInfoCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { Menu, X } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    navigate("/login");
    window.location.reload(); // Force refresh to update App state
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/transactions", label: "Transactions", icon: <FaMoneyBillWave /> },
    { path: "/categories", label: "Categories", icon: <FaFolderOpen /> },
    { path: "/wallets", label: "Wallets", icon: <FaWallet /> },
    { path: "/accounts", label: "Accounts", icon: <FaUniversity /> },
    { path: "/savings", label: "Savings", icon: <FaPiggyBank /> },
    { path: "/budgets", label: "Budgets", icon: <FaCalendarAlt /> },
    { path: "/reports", label: "Reports", icon: <FaChartLine /> },
    { path: "/abouts", label: "About Us", icon: <FaInfoCircle /> },
  ];

  return (
    <>
      {/* Horizontal Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-200 shadow-lg border-b border-gray-700 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-3xl">💸</span>
              <div>
                <h1 className="text-xl font-bold text-white">Money Lover</h1>
                <p className="text-gray-400 text-xs hidden sm:block">Finance Manager</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap
                      transition-all duration-300 border
                      ${active
                        ? "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                        : "border-transparent hover:bg-white/5 text-gray-400 hover:text-white"
                      }`}
                  >
                    <span className="text-lg">
                      {React.cloneElement(item.icon, {
                        size: 16,
                        color: active ? "#4ade80" : "currentColor", // Tailwind green-400
                      })}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  hover:bg-red-600 text-gray-300 hover:text-white transition-all duration-200"
              >
                <FaSignOutAlt size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-300 hover:text-white transition-colors p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden bg-gray-800 border-t border-gray-700 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"
            }`}
        >
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${active
                      ? "bg-green-600 text-white shadow-md"
                      : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                  <span className="text-lg">
                    {React.cloneElement(item.icon, {
                      size: 18,
                      color: active ? "#ffffff" : "#9ca3af",
                    })}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* Mobile Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                hover:bg-red-600 text-gray-300 hover:text-white transition-all duration-200"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
