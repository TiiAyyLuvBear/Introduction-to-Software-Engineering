// controllers/accountController.js (User Profile Management)
import userService from '../services/users.js';

/**
 * Controller: Sync profile from Firebase to MongoDB
 * 
 * Endpoint: POST /accounts/sync-profile
 * 
 * Body: { token, name, email, avatarURL?, phoneNumber? }
 * 
 * Use case: Đồng bộ thông tin user từ Firebase sang MongoDB sau khi login
 */
export async function syncProfile(req, res) {
    try {
        const profileData = req.body;
        const user = await userService.syncProfile(profileData);

        res.json({
            message: 'Profile synced successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarURL: user.avatarURL,
                phoneNumber: user.phoneNumber,
                roles: user.roles
            }
        });
    } catch (err) {
        console.error('Sync profile error:', err);
        if (err.message.includes('auth/id-token-expired')) {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (err.message.includes('auth/argument-error')) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
}

/**
 * Controller: Update user profile
 * 
 * Endpoint: PUT /accounts/update-profile
 * 
 * Body: { token, name?, phoneNumber?, avatarURL? }
 * 
 * Use case: Cập nhật thông tin user (không cho phép thay đổi email)
 * 
 * Note: Email field sẽ bị bỏ qua nếu có trong request
 */
export async function updateProfile(req, res) {
    try {
        const { token, ...updates } = req.body;

        console.log('[accountController] Received updateProfile request with updates:', updates);

        // Verify Firebase token to get userId
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Import admin here to avoid circular dependency
        const admin = (await import('firebase-admin')).default;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        console.log('[accountController] Verified Firebase token, userId:', userId);

        // Remove email from updates if present
        if (updates.email) {
            delete updates.email;
        }

        const updatedUser = await userService.updateProfile(userId, updates);

        console.log('[accountController] MongoDB update successful, returning user:', updatedUser);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatarURL: updatedUser.avatarURL,
                phoneNumber: updatedUser.phoneNumber,
                roles: updatedUser.roles
            }
        });
    } catch (err) {
        console.error('Update profile error:', err);
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message });
        }
        if (err.message === 'Email cannot be changed') {
            return res.status(400).json({ error: err.message });
        }
        if (err.message.includes('auth/id-token-expired')) {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (err.message.includes('auth/argument-error')) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
}
