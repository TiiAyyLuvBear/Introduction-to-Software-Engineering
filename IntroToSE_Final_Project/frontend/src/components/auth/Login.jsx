import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock } from 'react-icons/fa'

export default function Login({ onLogin, onNavigate }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Demo credentials
  const demoEmail = 'demo@example.com'
  const demoPassword = 'password123'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      if (email === demoEmail && password === demoPassword) {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('currentUser', JSON.stringify({
          id: 'demo-user-1',
          name: 'Demo User',
          email: email
        }))
        setMessage({ type: 'success', text: 'Login successful!' })
        setTimeout(() => {
          if (onLogin) onLogin({ email })
          navigate('/dashboard')
        }, 500)
      } else {
        setMessage({ type: 'error', text: `Invalid credentials. Try demo@example.com / password123` })
      }
      setLoading(false)
    }, 800)
  }

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email)
  }

  const handleSendReset = () => {
    setMessage(null)
    if (!validateEmail(forgotEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email.' })
      return
    }
    // Demo: simulate sending reset email
    setMessage({ type: 'success', text: 'Password reset email sent to your inbox.' })
    setTimeout(() => setShowForgot(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💸 4 Money</h1>
          <p className="text-gray-600">Smart Finance Manager</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <strong>Demo:</strong> demo@example.com / password123
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setShowForgot(s => !s)}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Forgot Password?
            </button>
            <div className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Register now
              </button>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm ${
                  message.type === 'error' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReset}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Send Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
