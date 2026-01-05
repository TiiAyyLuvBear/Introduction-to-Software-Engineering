import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject userId into params/body
api.interceptors.request.use(
    (config) => {
        try {
            const userStr = localStorage.getItem('ml_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const userId = user.id || user._id;

                if (userId) {
                    if (config.method === 'get' || config.method === 'delete') {
                        config.params = { ...config.params, userId };
                    } else if (config.method === 'post' || config.method === 'put') {
                        config.data = { ...config.data, userId };
                    }
                }
            }
        } catch (e) {
            console.error('Error injecting user ID:', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export const get = (url, params) => api.get(url, { params });
export const post = (url, data) => api.post(url, data);
export const put = (url, data) => api.put(url, data);
export const del = (url) => api.delete(url);

export default api;