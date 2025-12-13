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
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FaEnvelope, FaLock, FaUser, FaGoogle, FaFacebook } from 'react-icons/fa'
import { currentUser } from '../mockData'

export default function Authentication() {
  // State quản lý hiển thị form login hay register
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Hook để redirect sau khi login
  const navigate = useNavigate()

  // React Hook Form cho Login
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin } } = useForm({
    defaultValues: {
      email: 'demo@example.com', // Pre-fill for demo
      password: '123456'
    }
  })

  // React Hook Form cho Register
  const { register: registerForm, handleSubmit: handleSubmitRegister, watch, formState: { errors: errorsRegister } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  /**
   * Handler: Submit form login
   * DEMO: Sử dụng mockData để đăng nhập
   * Credentials: demo@example.com / 123456
   */
  const onSubmitLogin = async (data) => {
    setError('')
    setSuccess('')
    
    // DEMO: Check credentials với mockData
    // API Call would be: const response = await authAPI.login(data)
    
    if (data.email === currentUser.email && data.password === '123456') {
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      localStorage.setItem('isAuthenticated', 'true')
      
      setSuccess('Login successful! Redirecting...')
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } else {
      setError('Invalid email or password. Use demo@example.com / 123456')
    }
  }

  /**
   * Handler: Submit form register
   * DEMO: Tạo account mới và auto-login
   */
  const onSubmitRegister = async (data) => {
    setError('')
    setSuccess('')
    
    // Check password match
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    
    // DEMO: Create new user
    // API Call would be: const response = await authAPI.register(data)
    const newUser = {
      id: 'user_new_' + Date.now(),
      username: data.name.toLowerCase().replace(/\s+/g, '_'),
      email: data.email,
      fullName: data.name,
      avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
      createdAt: new Date().toISOString()
    }
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    localStorage.setItem('isAuthenticated', 'true')
    
    setSuccess('Account created successfully! Redirecting...')
    
    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard')
    }, 1000)
  }

  /**
   * Handler: Social login (Demo only)
   */
  const handleSocialLogin = (provider) => {
    console.log('Social login with:', provider)
    setError('Social login is not available in demo mode')
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

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Demo Credentials Info */}
        {isLogin && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            <strong>Demo Credentials:</strong> demo@example.com / 123456
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleSubmitLogin(onSubmitLogin)} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                {...registerLogin('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorsLogin.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errorsLogin.email && (
                <p className="mt-1 text-sm text-red-600">{errorsLogin.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                {...registerLogin('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorsLogin.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errorsLogin.password && (
                <p className="mt-1 text-sm text-red-600">{errorsLogin.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleSubmitRegister(onSubmitRegister)} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                {...registerForm('name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorsRegister.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errorsRegister.name && (
                <p className="mt-1 text-sm text-red-600">{errorsRegister.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                {...registerForm('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorsRegister.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errorsRegister.email && (
                <p className="mt-1 text-sm text-red-600">{errorsRegister.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                {...registerForm('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorsRegister.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errorsRegister.password && (
                <p className="mt-1 text-sm text-red-600">{errorsRegister.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                {...registerForm('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === watch('password') || 'Passwords do not match'
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorsRegister.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errorsRegister.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errorsRegister.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
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

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaGoogle className="text-red-500" />
            Google
          </button>
          <button 
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFacebook className="text-blue-600" />
            Facebook
          </button>
        </div>
      </div>
    </div>
  )
}
