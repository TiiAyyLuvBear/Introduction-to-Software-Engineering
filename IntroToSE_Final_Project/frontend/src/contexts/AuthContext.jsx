/**
 * Authentication Context
 * 
 * Manages JWT tokens and user session in React state (memory)
 * - More secure than localStorage (không bị XSS attacks)
 * - Token mất khi refresh page (user phải login lại)
 * - Có thể kết hợp với sessionStorage nếu muốn persist trong session
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { post, get } from '../services/api.js'

const AuthContext = createContext(null)

/**
 * Auth Provider Component
 * Wrap your app with this provider
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize: Try to restore session from sessionStorage (optional)
  useEffect(() => {
    restoreSession()
  }, [])

  /**
   * Restore session from sessionStorage (optional)
   * Comment out if you want pure memory storage
   */
  const restoreSession = () => {
    try {
      const storedToken = sessionStorage.getItem('ml_access_token')
      const storedRefreshToken = sessionStorage.getItem('ml_refresh_token')
      const storedUser = sessionStorage.getItem('ml_user')

      if (storedToken && storedUser) {
        setAccessToken(storedToken)
        setRefreshToken(storedRefreshToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save session to memory (and optionally sessionStorage)
   */
  const saveSession = ({ user, accessToken, refreshToken }) => {
    setUser(user)
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)

    // Optional: Save to sessionStorage (mất khi đóng tab)
    // Comment out nếu muốn pure memory storage
    if (accessToken) sessionStorage.setItem('ml_access_token', accessToken)
    if (refreshToken) sessionStorage.setItem('ml_refresh_token', refreshToken)
    if (user) sessionStorage.setItem('ml_user', JSON.stringify(user))
  }

  /**
   * Clear session from memory and storage
   */
  const clearSession = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)

    // Clear sessionStorage
    sessionStorage.removeItem('ml_access_token')
    sessionStorage.removeItem('ml_refresh_token')
    sessionStorage.removeItem('ml_user')
  }

  /**
   * Register new user
   */
  const register = async ({ name, email, password }) => {
    const response = await post('/auth/register', { name, email, password })
    
    if (response.success && response.data) {
      saveSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    }
    
    return response
  }

  /**
   * Login user
   */
  const login = async ({ email, password }) => {
    const response = await post('/auth/login', { email, password })
    
    if (response.success && response.data) {
      saveSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    }
    
    return response
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout API (optional)
      await post('/auth/logout')
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      clearSession()
    }
  }

  /**
   * Get current user profile
   */
  const getProfile = async () => {
    const response = await get('/auth/profile')
    
    if (response.success && response.data?.user) {
      setUser(response.data.user)
    }
    
    return response
  }

  /**
   * Refresh access token
   */
  const refresh = async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await post('/auth/refresh', { refreshToken })
    
    if (response.success && response.data?.accessToken) {
      setAccessToken(response.data.accessToken)
      
      // Update sessionStorage
      sessionStorage.setItem('ml_access_token', response.data.accessToken)
    }
    
    return response
  }

  const value = {
    // State
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!accessToken,

    // Methods
    register,
    login,
    logout,
    getProfile,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}

export default AuthContext
