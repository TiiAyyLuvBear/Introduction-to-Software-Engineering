/**
 * ============================================================================
 * AUTHENTICATION PAGE - TRANG ĐĂNG NHẬP/ĐĂNG KÝ
 * ============================================================================
 * 
 * NHIỆM VỤ: Xây dựng GIAO DIỆN đăng nhập/đăng ký (chỉ UI, không cần API)
 * 
 * ============================================================================
 * YÊU CẦU GIAO DIỆN:
 * ============================================================================
 * 
 * 1. LAYOUT TỔNG THỂ:
 *    ✅ Background gradient (blue to purple)
 *    ✅ Card trắng ở giữa màn hình
 *    ✅ Logo "💸 Money Lover" ở đầu
 *    ✅ Responsive (đẹp trên mobile và desktop)
 * 
 * 2. TOGGLE TABS:
 *    ✅ 2 tabs: "Login" và "Register"
 *    ✅ Tab active: background trắng, text xanh, có shadow
 *    ✅ Tab inactive: background xám nhạt
 *    ✅ Click để chuyển đổi
 * 
 * 3. FORM ĐĂNG NHẬP:
 *    ✅ Input Email (type="email", icon 📧)
 *    ✅ Input Password (type="password", icon 🔒)
 *    ✅ Checkbox "Remember me"
 *    ✅ Link "Forgot password?" bên phải
 *    ✅ Button "Login" full width, màu xanh
 * 
 * 4. FORM ĐĂNG KÝ:
 *    ✅ Input Full Name (type="text", icon 👤)
 *    ✅ Input Email (type="email", icon 📧)
 *    ✅ Input Password (type="password", icon 🔒)
 *    ✅ Input Confirm Password (type="password", icon 🔒)
 *    ✅ Button "Create Account" full width, màu xanh
 * 
 * 5. DIVIDER & SOCIAL LOGIN:
 *    ✅ Đường kẻ ngang với text "Or continue with"
 *    ✅ 2 buttons: Google và Facebook
 *    ✅ Có logo/icon của từng service
 *    ✅ Border, hover effect
 * 
 * ============================================================================
 * HƯỚNG DẪN IMPLEMENT (CHỈ FRONTEND):
 * ============================================================================
 * 
 * BƯỚC 1: Setup State (2 state cần thiết)
 * ----------------------------------------
 * const [isLogin, setIsLogin] = useState(true)
 * → Quản lý hiển thị form Login hay Register
 * → true = Login, false = Register
 * 
 * const [formData, setFormData] = useState({
 *   name: '',
 *   email: '',
 *   password: '',
 *   confirmPassword: ''
 * })
 * → Lưu dữ liệu từ input
 * 
 * BƯỚC 2: Tạo Container & Background
 * -----------------------------------
 * <div className="min-h-screen flex items-center justify-center 
 *                 bg-gradient-to-br from-blue-500 to-purple-600 p-4">
 *   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
 *     ...
 *   </div>
 * </div>
 * 
 * BƯỚC 3: Tạo Logo & Tabs
 * ------------------------
 * <div className="text-center mb-8">
 *   <h1 className="text-4xl font-bold">💸 Money Lover</h1>
 *   <p>Welcome back!</p>
 * </div>
 * 
 * <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
 *   <button onClick={() => setIsLogin(true)} 
 *           className={isLogin ? 'bg-white shadow' : ''}>
 *     Login
 *   </button>
 *   <button onClick={() => setIsLogin(false)}
 *           className={!isLogin ? 'bg-white shadow' : ''}>
 *     Register
 *   </button>
 * </div>
 * 
 * BƯỚC 4: Tạo Forms (Conditional Rendering)
 * ------------------------------------------
 * {isLogin ? (
 *   <form className="space-y-4">
 *     <input type="email" placeholder="Email" />
 *     <input type="password" placeholder="Password" />
 *     <button type="submit">Login</button>
 *   </form>
 * ) : (
 *   <form className="space-y-4">
 *     <input type="text" placeholder="Full Name" />
 *     <input type="email" placeholder="Email" />
 *     <input type="password" placeholder="Password" />
 *     <input type="password" placeholder="Confirm Password" />
 *     <button type="submit">Create Account</button>
 *   </form>
 * )}
 * 
 * BƯỚC 5: Social Login Buttons (Optional nhưng đẹp)
 * --------------------------------------------------
 * <div className="grid grid-cols-2 gap-4">
 *   <button className="border rounded-lg py-3">
 *     🔵 Google
 *   </button>
 *   <button className="border rounded-lg py-3">
 *     📘 Facebook
 *   </button>
 * </div>
 * 
 * ============================================================================
 * TAILWIND CSS CLASSES CHỦ YẾU:
 * ============================================================================
 * 
 * Container:
 * - min-h-screen → Full height màn hình
 * - flex items-center justify-center → Căn giữa
 * - bg-gradient-to-br from-blue-500 to-purple-600 → Gradient background
 * - p-4 → Padding responsive
 * 
 * Card:
 * - bg-white → Nền trắng
 * - rounded-2xl → Bo góc tròn
 * - shadow-2xl → Đổ bóng đậm
 * - w-full max-w-md → Width responsive
 * - p-8 → Padding trong card
 * 
 * Input:
 * - w-full → Full width
 * - px-4 py-3 → Padding ngang và dọc
 * - border border-gray-300 → Viền xám
 * - rounded-lg → Bo góc
 * - focus:outline-none focus:ring-2 focus:ring-blue-500 → Focus effect
 * 
 * Button:
 * - w-full → Full width
 * - bg-blue-600 text-white → Màu xanh, chữ trắng
 * - py-3 rounded-lg → Padding và bo góc
 * - font-medium → Chữ đậm vừa
 * - hover:bg-blue-700 → Hover tối hơn
 * - transition-colors → Animation mượt
 * 
 * ============================================================================
 * DEMO CHECKLIST (Những gì cần hiển thị):
 * ============================================================================
 * ✅ Background gradient đẹp
 * ✅ Card trắng nổi bật ở giữa
 * ✅ Logo Money Lover với emoji
 * ✅ 2 tabs Login/Register toggle được
 * ✅ Form Login: Email + Password + Remember me + Forgot password
 * ✅ Form Register: Name + Email + Password + Confirm Password
 * ✅ Button submit màu xanh, full width
 * ✅ Divider "Or continue with"
 * ✅ 2 buttons Google + Facebook với icon
 * ✅ Responsive trên mobile
 * ✅ Hover effects trên buttons
 * ✅ Focus effects trên inputs
 * 
 * ============================================================================
 * LƯU Ý:
 * ============================================================================
 * - KHÔNG CẦN implement API, validation, authentication logic
 * - CHỈ CẦN UI đẹp, responsive, interactive (click toggle được)
 * - Dùng console.log() để test form submit (không cần thật)
 * - Mock data nếu cần: email: "demo@example.com", password: "123456"
 * 
 * ============================================================================
 */

import React, { useState } from 'react'

export default function Authentication() {
  // TODO: Implement 2 state cơ bản
  // const [isLogin, setIsLogin] = useState(true)
  // const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  // TODO: Implement handleSubmit (chỉ cần console.log để demo)
  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   console.log('Form submitted:', formData)
  //   alert(isLogin ? 'Login successful!' : 'Account created!')
  // }

  // TODO: Implement UI theo hướng dẫn ở trên
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 ...">
  //     ...
  //   </div>
  // )
  // State quản lý hiển thị form login hay register
  const [isLogin, setIsLogin] = useState(true)
  
  // State quản lý data form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Hook để redirect sau khi login
  const navigate = useNavigate()

  /**
   * Handler: Submit form login
   * 
   * Flow:
   * 1. Validate email và password không rỗng
   * 2. Call API POST /api/auth/login với { email, password }
   * 3. Lưu JWT token vào localStorage
   * 4. Redirect về /dashboard
   */
  const handleLogin = async (e) => {
    e.preventDefault()
    // TODO: Implement login logic
    console.log('Login with:', { email: formData.email, password: formData.password })
    
    // Mock: Redirect to dashboard
    // navigate('/dashboard')
  }

  /**
   * Handler: Submit form register
   * 
   * Flow:
   * 1. Validate: email format, password >= 6 chars, password === confirmPassword
   * 2. Call API POST /api/auth/register với { name, email, password }
   * 3. Tự động login hoặc chuyển sang form login
   */
  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    // TODO: Implement register logic
    console.log('Register with:', { 
      name: formData.name, 
      email: formData.email, 
      password: formData.password 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {/* Container Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo và Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💸 Money Lover</h1>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Toggle Tabs: Login / Register */}
        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength="6"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Account
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  )
}
