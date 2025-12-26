/**
 * Routes: Authentication endpoints
 * 
 * Base path: /api/auth
 * 
 * Endpoints:
 * - POST /api/auth/register - Đăng ký user mới
 * - POST /api/auth/login    - Đăng nhập và nhận JWT token
 * - POST /api/auth/logout   - Đăng xuất (invalidate token)
 * - GET  /api/auth/profile  - Lấy thông tin user hiện tại (requires auth)
 * - POST /api/auth/refresh  - Refresh access token
 */
import express from 'express';
import {
  handleRegister,
  handleLogin
} from '../controllers/authController.js'
import authenticate from '../middleware/auth.js';
const router = express.Router()

// Simple in-memory rate limiting for password reset requests
// U003: Max 3 requests per hour per IP address
const resetRate = new Map()
function rateLimitForgotPassword(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const limit = 3

  const timestamps = resetRate.get(ip) || []
  const fresh = timestamps.filter((t) => now - t < windowMs)
  if (fresh.length >= limit) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' })
  }
  fresh.push(now)
  resetRate.set(ip, fresh)
  next()
}

// Public routes (NO authentication required)
router.post('/register', handleRegister);
router.post('/login', handleLogin);
// router.post('/refresh', refreshToken);

// Protected routes (require authentication)
// router.post('/logout', authenticate, logout);
// router.get('/profile', authenticate, getProfile);

export default router;
