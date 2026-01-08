/**
 * Routes: User endpoints
 *
 * Base path: /api/users
 *
 * Định nghĩa các REST API endpoints cho User resource:
 * - GET    /api/users          -> Lấy danh sách users (có pagination)
 * - GET    /api/users/:id      -> Lấy chi tiết 1 user
 * - POST   /api/users          -> Tạo user mới (đăng ký)
 * - PUT    /api/users/:id      -> Cập nhật thông tin user
 * - DELETE /api/users/:id      -> Xóa user
 *
 * Router được đăng ký trong server.js:
 * app.use('/api/users', usersRouter)
 */

import express from 'express'
import authenticate from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { updateProfile } from '../services/users.js'
import { uploadAvatar, uploadMemory } from '../middleware/upload.js'

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

// PUT /api/users/me - Update current user profile
router.put('/me', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        console.log('[PUT /api/users/me] User ID:', userId);
        console.log('[PUT /api/users/me] Updates:', updates);

        // Call service to update profile
        const updatedUser = await updateProfile(userId, updates);

        return sendSuccess(res, {
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                fullName: updatedUser.fullName,
                avatarURL: updatedUser.avatarURL,
                phoneNumber: updatedUser.phoneNumber,
                roles: updatedUser.roles
            }
        }, 'Profile updated successfully');
    } catch (error) {
        console.error('[PUT /api/users/me] Error:', error);
        return sendError(res, error.message || 'Failed to update profile', 500);
    }
})

// POST /api/users/avatar - Upload avatar as Base64 (stored in MongoDB)
router.post('/avatar', authenticate, uploadMemory.single('avatar'), async (req, res) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        console.log('[POST /api/users/avatar] User ID:', userId);
        console.log('[POST /api/users/avatar] File:', file);

        if (!file) {
            return sendError(res, 'No file uploaded', 400);
        }

        // Convert image to Base64 string
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        console.log('[POST /api/users/avatar] Base64 length:', base64Image.length);

        // Return Base64 string (don't save to DB yet - user must click Save Changes)
        return sendSuccess(res, {
            avatarURL: base64Image
        }, 'Avatar uploaded successfully. Click Save Changes to update your profile.');


    } catch (error) {
        console.error('[POST /api/users/avatar] Error:', error);
        return sendError(res, error.message || 'Failed to upload avatar', 500);
    }
})

export default router

