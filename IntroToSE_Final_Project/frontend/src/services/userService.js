/**
 * User Service - API calls for user profile management
 * Không sử dụng localStorage hay Firebase, chỉ gọi backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

/**
 * Make authenticated API request
 */
const request = async (method, endpoint, body = null) => {
    const token = getAuthToken();

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    return request('GET', '/users/me');
};

/**
 * Update user profile
 * @param {Object} updates - { name?, phoneNumber?, avatarURL? }
 */
export const updateUserProfile = async (updates) => {
    return request('PUT', '/users/me', updates);
};

/**
 * Upload avatar image
 * @param {File} file - Image file
 */
export const uploadAvatar = async (file) => {
    const token = getAuthToken();

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to upload avatar');
    }

    return data;
};

export default {
    getCurrentUser,
    updateUserProfile,
    uploadAvatar
};
