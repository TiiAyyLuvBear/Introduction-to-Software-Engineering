import api from './api';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import auth from './firebase.js';
import tokenResolver from './tokenResolver.js';

const authService = {
    register: async (email, password, name) => {
        try {
            // 1. Tạo user trong Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseToken = await userCredential.user.getIdToken();

            // 2. Gửi lên backend để đồng bộ MongoDB và lấy JWT tokens
            const response = await api.post('/auth/register', {
                token: firebaseToken,
                name,
                email,
                password
            });

            // 3. Lưu JWT tokens vào localStorage
            const { accessToken, refreshToken, user } = response.data.data;
            tokenResolver.setTokens(accessToken, refreshToken);

            // 4. Lưu user info vào localStorage
            localStorage.setItem('ml_user', JSON.stringify(user));

            // 5. Return data để App.jsx có thể update state
            return {
                user,
                accessToken,
                refreshToken
            };
        } catch (error) {
            console.error('[authService] Register error:', error);
            console.error('[authService] Error code:', error.code);
            console.error('[authService] Error message:', error.message);
            
            // Xử lý và chuyển đổi lỗi Firebase thành message dễ hiểu
            let userMessage = 'Registration failed. Please try again.';
            
            const errorCode = error.code || '';
            const errorMessage = error.message || '';
            
            // Xử lý các lỗi Firebase
            if (errorCode === 'auth/email-already-in-use' || 
                errorMessage.includes('EMAIL_EXISTS') || 
                errorMessage.includes('email-already-in-use')) {
                userMessage = 'This email is already registered. Please use a different email or sign in.';
            } else if (errorCode === 'auth/weak-password' || 
                       errorMessage.includes('WEAK_PASSWORD')) {
                userMessage = 'Password is too weak. Please use at least 6 characters.';
            } else if (errorCode === 'auth/invalid-email' || 
                       errorMessage.includes('INVALID_EMAIL')) {
                userMessage = 'Invalid email address. Please check and try again.';
            } else if (errorCode === 'auth/operation-not-allowed') {
                userMessage = 'This registration method is not enabled. Please contact support.';
            } else if (errorCode === 'auth/network-request-failed') {
                userMessage = 'Network error. Please check your internet connection.';
            } else if (errorMessage.includes('User already exists')) {
                userMessage = 'This email is already registered. Please use a different email or sign in.';
            }
            
            // Throw error với message đã được xử lý
            const enhancedError = new Error(userMessage);
            enhancedError.code = errorCode;
            enhancedError.originalError = error;
            throw enhancedError;
        }
    },

    loginWithEmail: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            const response = await api.post('/auth/login', {
                token,
                email,
                password
            });

            // Lưu JWT tokens vào localStorage
            const { accessToken, refreshToken, user } = response.data.data;
            tokenResolver.setTokens(accessToken, refreshToken);
            localStorage.setItem('ml_user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            console.error('[authService] Login error:', error);
            
            let userMessage = 'Login failed. Please try again.';
            const errorCode = error.code || '';
            const errorMessage = error.message || '';
            
            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' ||
                errorCode === 'auth/invalid-credential') {
                userMessage = 'Invalid email or password. Please check and try again.';
            } else if (errorCode === 'auth/too-many-requests') {
                userMessage = 'Too many failed attempts. Please try again later.';
            } else if (errorCode === 'auth/user-disabled') {
                userMessage = 'This account has been disabled. Please contact support.';
            } else if (errorCode === 'auth/network-request-failed') {
                userMessage = 'Network error. Please check your internet connection.';
            }
            
            const enhancedError = new Error(userMessage);
            enhancedError.code = errorCode;
            enhancedError.originalError = error;
            throw enhancedError;
        }
    },

    loginWithGoogle: async () => {
        try {
            const provider = new GoogleAuthProvider();
            console.log('[authService] Starting Google sign in...');
            
            const userCredential = await signInWithPopup(auth, provider);
            console.log('[authService] Got user credential:', userCredential.user.email);
            
            const firebaseToken = await userCredential.user.getIdToken();
            console.log('[authService] Got Firebase token, calling backend...');
            
            const response = await api.post('/auth/login', {
                token: firebaseToken,
                email: userCredential.user.email,
                name: userCredential.user.displayName
            });
            console.log('[authService] Backend response:', response.data);

            // Lưu JWT tokens vào localStorage
            const { accessToken, refreshToken, user } = response.data.data;
            tokenResolver.setTokens(accessToken, refreshToken);
            localStorage.setItem('ml_user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            console.error('[authService] Google login error:', error);
            console.error('[authService] Error code:', error.code);
            console.error('[authService] Error message:', error.message);
            
            let userMessage = 'Google login failed. Please try again.';
            const errorCode = error.code || '';
            
            if (errorCode === 'auth/popup-closed-by-user') {
                userMessage = 'Sign in cancelled. Please try again.';
            } else if (errorCode === 'auth/popup-blocked') {
                userMessage = 'Popup blocked. Please allow popups and try again.';
            } else if (errorCode === 'auth/cancelled-popup-request') {
                userMessage = 'Sign in cancelled. Please try again.';
            } else if (errorCode === 'auth/network-request-failed') {
                userMessage = 'Network error. Please check your internet connection.';
            }
            
            const enhancedError = new Error(userMessage);
            enhancedError.code = errorCode;
            enhancedError.originalError = error;
            throw enhancedError;
        }
    }
};

export default authService;
