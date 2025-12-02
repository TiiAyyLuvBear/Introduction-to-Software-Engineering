import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
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
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

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
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

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

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id)

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
