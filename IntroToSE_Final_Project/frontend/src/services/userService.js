/**
 * User Service - API calls for user profile management
 * Không sử dụng localStorage hay Firebase, chỉ gọi backend API
 */
import api from './api.js';

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('[userService] Get current user error:', error);

        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load profile';
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        throw enhancedError;
    }
}

export const updateUserProfile = async (updates) => {
    try {
        const response = await api.put('/users/me', updates);
        return response.data;
    } catch (error) {
        console.error('[userService] Update user profile error:', error);

        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile';
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        throw enhancedError;
    }
}

export const uploadAvatar = async (file) => {
    try {
        // Validate file
        if (!file) {
            throw new Error('Please select an image file');
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            throw new Error('Image size must be less than 2MB');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }

        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('[userService] Upload avatar error:', error);

        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload avatar';
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        throw enhancedError;
    }
}

export const getServerBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
}

const userService = {
    getCurrentUser,
    updateUserProfile,
    uploadAvatar,
    getServerBaseUrl
};

export default userService;
