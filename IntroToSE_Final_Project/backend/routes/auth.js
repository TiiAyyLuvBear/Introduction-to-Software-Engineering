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

// Public routes (NO authentication required)
router.post('/register', handleRegister);
router.post('/login', handleLogin);
// router.post('/refresh', refreshToken);

// Protected routes (require authentication)
// router.post('/logout', authenticate, logout);
// router.get('/profile', authenticate, getProfile);

export default router;
