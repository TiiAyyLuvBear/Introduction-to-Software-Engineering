/**
 * Authentication Middleware
 * 
 * Verifies JWT token from Authorization header
 * and adds user info to req.user
 */
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Middleware to verify JWT token and authenticate requests
 * 
 * Usage:
 * router.get('/protected-route', authenticate, controller)
 * 
 * Expected header:
 * Authorization: Bearer <token>
 * 
 * On success: adds req.user = { id, email }
 * On failure: returns 401 Unauthorized
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Authorization header must be: Bearer <token>'
      })
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7)

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Check token type
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type. Use access token for API requests.'
      })
    }

    // Add user info to request object
    req.user = {
      id: decoded.id
    }

    // Continue to next middleware/controller
    next()

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again or refresh your token.'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please login again.'
      })
    }

    console.error('Authentication error:', error)
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    })
  }
}

/**
 * Optional authentication middleware
 * 
 * Adds user info if token is valid, but doesn't block if no token
 * Useful for routes that work both for authenticated and guest users
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, JWT_SECRET)
      
      if (decoded.type === 'access') {
        req.user = { id: decoded.id }
      }
    }

    next()

  } catch (error) {
    // Silently fail for optional authentication
    next()
  }
}
