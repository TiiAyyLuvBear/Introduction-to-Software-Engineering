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
            console.log('[accountService] Current Firebase user:', user ? user.uid : 'null');

            if (!user) {
                throw new Error('User not logged in');
            }

            console.log('[accountService] Getting Firebase token...');
            const token = await user.getIdToken();
            console.log('[accountService] Token obtained, length:', token.length);

            // Remove email from updates if present (không cho phép thay đổi email)
            const { email, ...allowedUpdates } = updates;

            const payload = {
                token,
                ...allowedUpdates
            };

            console.log('[accountService] Calling PUT /accounts/update-profile with payload:', payload);
            console.log('[accountService] avatarURL in payload:', payload.avatarURL ? `${payload.avatarURL.substring(0, 50)}...` : 'null');
            const response = await api.put('/accounts/update-profile', payload);
            console.log('[accountService] API response:', response.data);

            // Update localStorage with new user data from backend response
            if (response.data.user) {
                const storedUser = JSON.parse(localStorage.getItem('ml_user') || '{}');
                const updatedUser = {
                    ...storedUser,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    avatarURL: response.data.user.avatarURL,
                    phoneNumber: response.data.user.phoneNumber,
                    id: response.data.user.id || response.data.user._id
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
