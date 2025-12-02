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
import express from 'express'
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  refreshToken 
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)

// Protected routes (require authentication)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)

export default router
