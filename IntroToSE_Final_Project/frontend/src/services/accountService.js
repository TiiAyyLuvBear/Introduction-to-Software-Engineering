import api from './api';
import auth from './firebase.js';

const accountService = {
    syncProfile: async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not logged in');
            }

            const token = await user.getIdToken();

            const payload = {
                token,
                name: user.displayName || '',
                email: user.email,
                avatarURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
            };

            const response = await api.post('/accounts/sync-profile', payload);
            return response.data;
        } catch (error) {
            console.error('Sync profile error:', error);
            throw error;
        }
    },

    /**
     * Update user profile (không cho phép thay đổi email)
     * 
     * @param {Object} updates - { name?, phoneNumber?, avatarURL? }
     * @returns {Promise} Response data
     */
    updateProfile: async (updates) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not logged in');
            }

            const token = await user.getIdToken();

            // Remove email from updates if present (không cho phép thay đổi email)
            const { email, ...allowedUpdates } = updates;

            const payload = {
                token,
                ...allowedUpdates
            };

            const response = await api.put('/accounts/update-profile', payload);

            // Update localStorage with new user data
            if (response.data.user) {
                const storedUser = JSON.parse(localStorage.getItem('ml_user') || '{}');
                const updatedUser = {
                    ...storedUser,
                    ...response.data.user
                };
                localStorage.setItem('ml_user', JSON.stringify(updatedUser));
            }

            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
};

export default accountService;
