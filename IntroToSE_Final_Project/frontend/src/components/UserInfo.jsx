/**
 * ============================================================================
 * USERINFO COMPONENT - HIỂN THỊ THÔNG TIN USER VÀ DROPDOWN MENU
 * ============================================================================
 * 
 * NHIỆM VỤ: Tạo GIAO DIỆN user info dropdown (chỉ UI, dùng mock data)
 * 
 * ============================================================================
 * YÊU CẦU GIAO DIỆN:
 * ============================================================================
 * 
 * 1. USER BUTTON (Trước khi click):
 *    ✅ Avatar tròn (w-10 h-10, border xanh)
 *    ✅ Tên user (font-semibold)
 *    ✅ Email (text-xs, ẩn trên mobile: hidden md:block)
 *    ✅ Icon ChevronDown (rotate 180° khi mở)
 *    ✅ Hover: background xám nhạt (hover:bg-gray-100)
 * 
 * 2. DROPDOWN MENU (Sau khi click):
 *    ✅ Position: absolute, right-0, mt-2
 *    ✅ Background trắng với shadow-lg
 *    ✅ Width: w-64
 *    ✅ Border radius: rounded-lg
 *    ✅ Z-index: z-50 (hiển thị trên cùng)
 * 
 * 3. MENU ITEMS:
 *    ✅ Profile (icon User, text-gray-700)
 *    ✅ Settings (icon Settings, text-gray-700)
 *    ✅ Divider (border-t border-gray-200)
 *    ✅ Logout (icon LogOut, text-red-600, hover:bg-red-50)
 *    ✅ Mỗi item: hover:bg-gray-100, transition-colors
 * 
 * 4. INTERACTIONS:
 *    ✅ Click button → toggle dropdown
 *    ✅ Click outside → đóng dropdown (useRef + useEffect)
 *    ✅ Click menu item → log ra console (demo)
 * 
 * ============================================================================
 * HƯỚNG DẪN XÂY DỰNG GIAO DIỆN:
 * ============================================================================
 * 
 * BƯỚC 1: SETUP STATE & REF
 * --------------------------
 * Import useState, useRef, useEffect từ react
 * Import User, Settings, LogOut, ChevronDown từ lucide-react
 * 
 * State cần tạo:
 * - isOpen: boolean (false) - trạng thái dropdown mở/đóng
 * - dropdownRef: useRef(null) - ref để detect click outside
 * 
 * Mock data user để demo:
 * - name, email, avatar URL
 * 
 * BƯỚC 2: CLICK OUTSIDE DETECTION
 * --------------------------------
 * Dùng useEffect với dependency isOpen
 * Tạo function handleClickOutside check dropdownRef.current
 * Nếu click outside thì setIsOpen(false)
 * addEventListener mousedown khi isOpen true
 * removeEventListener khi component unmount
 * 
 * BƯỚC 3: USER BUTTON LAYOUT
 * ---------------------------
 * Container div: relative position, attach dropdownRef
 * Button với onClick toggle isOpen
 * Classes: flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors
 * 
 * Nội dung button:
 * - Avatar img: w-10 h-10 rounded-full border-2 border-primary
 * - User info div: flex flex-col items-start
 *   + Name span: text-sm font-semibold text-gray-800
 *   + Email span: text-xs text-gray-500 hidden md:block
 * - ChevronDown icon: w-4 h-4 transition-transform, rotate-180 khi isOpen
 * 
 * BƯỚC 4: DROPDOWN MENU LAYOUT
 * -----------------------------
 * Conditional render khi isOpen = true
 * Container div: absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50
 * 
 * Menu items:
 * 1. Profile button: w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100
 *    - User icon w-5 h-5 text-gray-700
 *    - Text "Profile"
 * 
 * 2. Settings button: tương tự Profile
 *    - Settings icon
 *    - Text "Settings"
 * 
 * 3. Divider: border-t border-gray-200 my-1
 * 
 * 4. Logout button: tương tự nhưng hover:bg-red-50 text-red-600
 *    - LogOut icon
 *    - Text "Logout"
 * 
 * ============================================================================
 * TAILWIND CSS CLASSES REFERENCE:
 * ============================================================================
 * 
 * 📦 CONTAINER:
 * - relative: Để dropdown absolute positioning
 * - ref={dropdownRef}: Cho click outside detection
 * 
 * 🔘 USER BUTTON:
 * - flex items-center gap-3: Layout ngang, căn giữa, gap 12px
 * - p-2: Padding 8px
 * - rounded-lg: Bo góc 8px
 * - hover:bg-gray-100: Hover màu xám nhạt
 * - transition-colors: Smooth transition
 * 
 * 🖼️ AVATAR:
 * - w-10 h-10: Kích thước 40x40px
 * - rounded-full: Hình tròn
 * - border-2 border-primary: Viền xanh 2px
 * 
 * 📝 TEXT:
 * - text-sm font-semibold: Tên (14px, đậm)
 * - text-xs text-gray-500: Email (12px, xám)
 * - hidden md:block: Ẩn trên mobile, hiện từ tablet
 * 
 * 📋 DROPDOWN:
 * - absolute right-0 mt-2: Vị trí góc phải, cách 8px
 * - w-64: Width 256px
 * - bg-white: Background trắng
 * - rounded-lg: Bo góc 8px
 * - shadow-lg: Đổ bóng lớn
 * - border border-gray-200: Viền xám nhạt
 * - z-50: Z-index cao (hiển thị trên cùng)
 * 
 * 🔲 MENU ITEM:
 * - w-full: Full width
 * - flex items-center gap-3: Icon + text layout
 * - px-4 py-3: Padding ngang 16px, dọc 12px
 * - hover:bg-gray-100: Hover xám nhạt (Profile, Settings)
 * - hover:bg-red-50: Hover đỏ nhạt (Logout)
 * - text-gray-700: Text xám đậm (Profile, Settings)
 * - text-red-600: Text đỏ (Logout)
 * - transition-colors: Smooth hover
 * 
 * ↕️ DIVIDER:
 * - border-t border-gray-200 my-1: Đường kẻ ngang, margin dọc 4px
 * 
 * 🔄 ANIMATION:
 * - transition-transform: Smooth rotation cho ChevronDown
 * - rotate-180: Xoay 180° khi dropdown mở
 * 
 * ============================================================================
 * MOCK DATA EXAMPLES:
 * ============================================================================
 * 
 * ```javascript
 * // Dùng mock data tĩnh để demo
 * const mockUsers = [
 *   {
 *     name: "Nguyễn Văn A",
 *     email: "nguyenvana@example.com",
 *     avatar: "https://i.pravatar.cc/150?img=1"
 *   },
 *   {
 *     name: "Trần Thị B",
 *     email: "tranthib@example.com",
 *     avatar: "https://i.pravatar.cc/150?img=5"
 *   },
 *   {
 *     name: "Lê Văn C",
 *     email: "levanc@example.com",
 *     avatar: "https://i.pravatar.cc/150?img=8"
 *   }
 * ];
 * 
 * // Dùng user đầu tiên để demo
 * const currentUser = mockUsers[0];
 * 
 * // Hoặc dùng UI Avatars API nếu không có ảnh
 * const generateAvatar = (name) => {
 *   return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;
 * };
 * ```
 * 
 * ============================================================================
 * DEMO CHECKLIST:
 * ============================================================================
 * ✅ Click button → dropdown toggle (mở/đóng)
 * ✅ Click outside → dropdown đóng
 * ✅ Click Profile → log "Profile clicked" ra console
 * ✅ Click Settings → log "Settings clicked" ra console
 * ✅ Click Logout → log "Logout clicked" ra console
 * ✅ Avatar hiển thị hình tròn với border xanh
 * ✅ ChevronDown xoay 180° khi mở
 * ✅ Email ẩn trên mobile (<768px)
 * ✅ Hover effects: gray-100 cho Profile/Settings, red-50 cho Logout
 * ✅ Dropdown có shadow và border
 * ✅ Divider ngăn cách giữa menu items và Logout
 * 
 * ============================================================================
 * NÂNG CAO (Optional):
 * ============================================================================
 * - Thêm notification badge (số thông báo chưa đọc)
 * - Dark mode toggle trong dropdown
 * - Keyboard navigation (Arrow keys, Enter, Esc)
 * - Animation khi dropdown mở/đóng
 * - Upload avatar mới
 * 
 * ============================================================================
 */

import React from 'react'
// import { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function UserInfo({ user, onLogout }) {
  // TODO: Setup state cho dropdown
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // TODO: Setup ref để detect click outside
  // const dropdownRef = useRef(null)
  
  // TODO: Setup navigate hook
  // const navigate = useNavigate()

  // TODO: Implement useEffect để handle click outside

  // TODO: Implement handleLogout function

  // TODO: Implement UI với avatar, dropdown menu
  // State quản lý dropdown open/close
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Ref để detect click outside
  const dropdownRef = useRef(null)
  
  const navigate = useNavigate()

  /**
   * Mock user data (thay bằng data thật từ API/Context)
   */
  const defaultUser = {
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    avatar: user?.avatar || 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff'
  }

  /**
   * Handler: Logout
   * 
   * Flow:
   * 1. Clear JWT token từ localStorage
   * 2. Call onLogout callback (nếu có)
   * 3. Redirect về trang login
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    if (onLogout) onLogout()
    navigate('/login')
  }

  /**
   * Effect: Đóng dropdown khi click outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button - Click để toggle dropdown */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <img
          src={defaultUser.avatar}
          alt={defaultUser.name}
          className="w-10 h-10 rounded-full border-2 border-blue-500"
        />
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-800">{defaultUser.name}</p>
          <p className="text-xs text-gray-500">{defaultUser.email}</p>
        </div>
        
        {/* Dropdown Icon */}
        <ChevronDown 
          size={20} 
          className={`text-gray-600 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info (hiển thị lại trong dropdown trên mobile) */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">{defaultUser.name}</p>
            <p className="text-xs text-gray-500">{defaultUser.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile Link */}
            <button
              onClick={() => {
                navigate('/profile')
                setIsDropdownOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            {/* Settings Link */}
            <button
              onClick={() => {
                navigate('/settings')
                setIsDropdownOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
