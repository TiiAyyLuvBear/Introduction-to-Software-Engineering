import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/**
 * Authentication Controller
 * 
 * Handles user authentication operations:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - Token refresh
 * - User profile retrieval
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_EXPIRES_IN = '30d'

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(String(email || '').trim())
}

// U002: min 8 chars + at least 1 special char
function validatePasswordComplexity(password) {
  const s = String(password || '')
  if (s.length < 8) return { ok: false, message: 'Password must be at least 8 characters long' }
  if (!/[^A-Za-z0-9]/.test(s)) return { ok: false, message: 'Password must include at least 1 special character' }
  return { ok: true }
}

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { id: userId, type: 'access', v: tokenVersion },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { id: userId, type: 'refresh', v: tokenVersion },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )
}

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      })
    }

    // Validate password complexity
    const pwCheck = validatePasswordComplexity(password)
    if (!pwCheck.ok) {
      return res.status(400).json({
        success: false,
        error: pwCheck.message
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    })

    await user.save()

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.tokenVersion || 0)
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion || 0)

    // Return user info and tokens (exclude password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      },
      message: 'User registered successfully'
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      message: error.message
    })
  }
}

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.tokenVersion || 0)
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion || 0)

    // Return user info and tokens
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to login',
      message: error.message
    })
  }
}

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // In a real app with token blacklist/whitelist:
    // 1. Add current token to blacklist
    // 2. Or remove from whitelist
    // For now, client-side should just remove the token

    res.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
      message: error.message
    })
  }
}

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: error.message
    })
  }
}

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (but requires valid refresh token)
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET)

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      })
    }

    // Ensure tokenVersion matches current user (revokes old tokens)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' })
    }
    if ((user.tokenVersion || 0) !== (decoded.v || 0)) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' })
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id, user.tokenVersion || 0)

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      },
      message: 'Token refreshed successfully'
    })

  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
      message: error.message
    })
  }
}

/**
 * U003 - Request password reset
 * POST /api/auth/forgot-password
 * Body: { email }
 * Response is privacy-safe (does not reveal if email exists).
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' })
    }

    const normalized = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalized })

    // Always return the same message (privacy)
    const safeMessage = 'If this email exists, we have sent a link'

    if (!user) {
      return res.json({ success: true, message: safeMessage })
    }

    // If Firebase Admin is configured, you can generate a reset link there.
    // For this project we fall back to a self-managed one-time token.
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetPasswordTokenHash = tokenHash
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    await user.save()

    const baseUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, '')
    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(normalized)}`
    console.log('[PasswordReset] Send reset link:', resetLink)

    // In dev, optionally return link to speed up testing
    if (process.env.RESET_PASSWORD_DEBUG_LINK === '1') {
      return res.json({ success: true, message: safeMessage, debug: { resetLink } })
    }

    return res.json({ success: true, message: safeMessage })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ success: false, error: 'Failed to request password reset' })
  }
}

/**
 * U003 - Confirm password reset
 * POST /api/auth/reset-password
 * Body: { email, token, password }
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body || {}
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' })
    }
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Reset token is required' })
    }

    const pwCheck = validatePasswordComplexity(password)
    if (!pwCheck.ok) {
      return res.status(400).json({ success: false, error: pwCheck.message })
    }

    const normalized = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalized })
    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
      return res.status(400).json({ success: false, error: 'Link expired' })
    }

    if (new Date(user.resetPasswordExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'Link expired' })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    if (tokenHash !== user.resetPasswordTokenHash) {
      return res.status(400).json({ success: false, error: 'Link expired' })
    }

    // Update password + invalidate old sessions
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(String(password), salt)
    user.resetPasswordTokenHash = undefined
    user.resetPasswordExpiresAt = undefined
    user.tokenVersion = (user.tokenVersion || 0) + 1
    await user.save()

    return res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ success: false, error: 'Failed to reset password' })
  }
}
