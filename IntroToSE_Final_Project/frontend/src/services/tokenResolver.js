// services/tokenResolver.js

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const tokenResolver = {
    getToken: () => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: () => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    removeTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    // Hàm này sẽ được gọi từ api.js khi token hết hạn
    // refreshAccessToken: async (axiosInstance) => {
    //     try {
    //         const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    //         if (!refreshToken) throw new Error("No refresh token");

    //         // Gọi API refresh token (Lưu ý: Hardcode url hoặc lấy từ config)
    //         const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });

    //         const { accessToken, newRefreshToken } = response.data;
    //         tokenResolver.setTokens(accessToken, newRefreshToken);

    //         return accessToken;
    //     } catch (error) {
    //         tokenResolver.removeTokens();
    //         window.location.href = '/login'; // Chuyển hướng về login nếu refresh thất bại
    //         throw error;
    //     }
    // }
};

export default tokenResolver;