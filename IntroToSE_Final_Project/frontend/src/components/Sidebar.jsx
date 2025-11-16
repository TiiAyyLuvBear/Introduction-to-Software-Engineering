/**
 * Sidebar Component - Navigation menu cố định bên trái
 *
 * Chức năng:
 * - Hiển thị logo và tên app
 * - Hiển thị menu navigation với React Router Link
 * - Highlight menu item đang active dựa trên URL
 * - Footer với social links
 * - Toggle button để ẩn/hiện sidebar
 *
 * Props:
 * - isOpen: boolean - state sidebar mở/đóng (từ App.jsx)
 * - setIsOpen: function - toggle sidebar state
 *
 * React Router:
 * - Dùng useLocation() để lấy URL hiện tại
 * - Dùng Link component để navigate (giữ state)
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Twitter, Menu, X } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  // Lấy location hiện tại từ React Router
  const location = useLocation();

  /**
   * Danh sách menu items
   * Mỗi item có:
   * - path: URL path (ví dụ: /dashboard)
   * - label: Text hiển thị
   * - icon: Emoji icon
   */
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/transactions", label: "Transactions", icon: "💰" },
    { path: "/categories", label: "Categories", icon: "📁" },
    { path: "/accounts", label: "Accounts", icon: "🏦" },
    { path: "/abouts", label: "Abouts", icon: "ℹ️" },
    //{ path: "/authenication", label: "Authenication", icon: null},
    { path: "/groupwallet", label: "Shared Wallet", icon:"😒"},
  ];

  return (
    <>
      {/* Toggle button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 hover:rounded-lg transition-colors shadow-lg"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Slide in/out */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        }`}
      >
        {/* Header với logo và tagline */}
        <div className="p-6 pt-20 border-b border-gray-700">
          <h1 className="text-2xl font-bold mb-2">💸 Money Lover</h1>
          <p className="text-sm text-gray-400">
            Introduction to Software Engineering
          </p>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul>
            {menuItems.map((item) => {
              // Check nếu item hiện tại đang active
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`px-6 py-3 flex items-center gap-3 transition-colors hover:bg-gray-700 ${
                      isActive ? "bg-blue-600 text-white rounded-lg" : ""
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer với social links */}
        <footer className="p-6 border-t border-gray-700 text-sm text-gray-400">
          <p className="text-center mb-4">Follow us on</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors transform hover:scale-150"
              title="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors transform hover:scale-150"
              title="Twitter"
            >
              <Twitter size={24} />
            </a>
          </div>
        </footer>
      </aside>

      {/* Overlay khi sidebar mở (trên mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
