import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

// React Icons (Feather)
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";

export default function UserInfo({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // React Hook Form demo (small form trả nghiệm UI dropdown)
  const { register, handleSubmit } = useForm();

  const defaultUser = {
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    avatar:
      user?.avatar ||
      "https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff",
  };

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("currentUser")
    if (onLogout) onLogout()
    navigate("/login")
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (data) => {
    console.log("Saved settings:", data);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img
          src={defaultUser.avatar}
          alt={defaultUser.name}
          className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm"
        />

        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-800">{defaultUser.name}</p>
          <p className="text-xs text-gray-500">{defaultUser.email}</p>
        </div>

        <FiChevronDown
          size={18}
          className={`text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
          {/* User info mobile */}
          <div className="px-4 py-3 border-b border-gray-200 md:hidden">
            <p className="text-sm font-semibold text-gray-800">
              {defaultUser.name}
            </p>
            <p className="text-xs text-gray-500">{defaultUser.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FiUser size={18} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                navigate("/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FiSettings size={18} />
              <span>Settings</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Small Form Example */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-3">
              <label className="text-xs text-gray-500">Nickname</label>
              <input
                {...register("nickname")}
                placeholder="Enter new nickname..."
                className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Save
              </button>
            </form>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
