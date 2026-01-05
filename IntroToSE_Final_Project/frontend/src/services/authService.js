import api from './api';
import tokenResolver from './tokenResolver.js';

const authService = {
    // Mock register without Firebase
    register: async (email, password, name) => {
        const response = await api.post('/auth/register', {
            name,
            email,
            password
        });

        if (response.data && response.data.success) {
            const { accessToken, refreshToken, user } = response.data.data;
            tokenResolver.setTokens(accessToken, refreshToken);
            localStorage.setItem('ml_user', JSON.stringify(user));
            return response.data; // Return data part expected by caller
        }
        return response.data;
    },

    // Login directly to backend without Firebase
    loginWithEmail: async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        if (response.data && response.data.success) {
            const { accessToken, refreshToken, user } = response.data.data;
            tokenResolver.setTokens(accessToken, refreshToken);
            localStorage.setItem('ml_user', JSON.stringify(user));
            return response.data; // Login.jsx expects result.data.user
        }
        return response.data;
    },

    // Google Login - NOT SUPPORTED in this integration without Firebase Config
    loginWithGoogle: async () => {
        throw new Error("Google Login not supported in this environment");
    }
};

export default authService;