// TODO: M1-04 - User Profile API Routes
// Người khác sẽ implement auth routes

import express from 'express'
import authController from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'
const router = express.Router()

/* Login Routes */
router.post('/login', authenticate, authController.login)

/* Register Routes */
router.post('/register', authenticate, authController.register)


export default router
