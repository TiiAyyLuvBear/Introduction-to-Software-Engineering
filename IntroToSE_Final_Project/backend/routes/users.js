/**
 * User Routes
 */

import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { sendSuccess } from '../utils/response.js'

const router = express.Router()

// GET /api/users/me - Get current user info
router.get('/me', authenticate, (req, res) => {
    try {
        // req.user đã được set bởi authenticate middleware
        return sendSuccess(res, {
            user: {
                _id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                fullName: req.user.fullName,
                avatarURL: req.user.avatarURL,
                phoneNumber: req.user.phoneNumber,
                roles: req.user.roles
            }
        }, 'User retrieved successfully');
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user info'
        });
    }
})

export default router
