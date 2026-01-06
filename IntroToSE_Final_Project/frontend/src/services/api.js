// services/api.js
import axios from 'axios';
import tokenResolver from './tokenResolver';

// 1. Tạo instance
// Note: Vite tự động load env variables từ .env file
// Không cần import dotenv trong frontend!
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api', // Thay bằng URL Backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor: Tự động gắn Token vào mỗi request
api.interceptors.request.use(
    (config) => {
        const token = tokenResolver.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor: Xử lý khi Token hết hạn (Lỗi 401)
api.interceptors.response.use(
    (response) => response, // Trả về data nếu thành công
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa từng thử retry (để tránh vòng lặp vô hạn)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gọi hàm refresh token từ tokenResolver
                const newToken = await tokenResolver.refreshAccessToken(axios);

                // Gán token mới vào header của request cũ
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                // Thực hiện lại request ban đầu
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;