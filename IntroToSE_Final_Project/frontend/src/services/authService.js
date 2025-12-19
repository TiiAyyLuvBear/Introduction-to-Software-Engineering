/**
 * Auth Service
 * 
 * Xử lý authentication với Firebase + Backend
 */

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import api from './api';

/**
 * Login với Email/Password
 * 
 * Flow:
 * 1. Login với Firebase
 * 2. Lấy ID token
 * 3. Gọi backend API để sync user
 */
export const login = async (email, password) => {
    try {
        // 1. Login với Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 2. Lấy ID token (api.js sẽ tự động attach vào request)
        const token = await userCredential.user.getIdToken();

        // 3. Gọi backend để sync user
        const response = await api.post('/auth/login');

        return {
            success: true,
            user: response.data.data.user,
            firebaseUser: userCredential.user
        };

    } catch (error) {
        console.error('Login error:', error);

        // Friendly error messages
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            throw new Error('Invalid email or password.');
        }

        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found with this email. Please register first.');
        }

        if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many failed login attempts. Please try again later.');
        }

        throw error;
    }
};

/**
 * Register với Email/Password
 * 
 * Flow:
 * 1. Tạo account trong Firebase
 * 2. Update display name
 * 3. Gọi backend để sync user
 */
export const register = async (email, password, name) => {
    try {
        // 1. Tạo account trong Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 2. Update display name
        await updateProfile(userCredential.user, {
            displayName: name
        });

        // 3. Gọi backend để sync user
        const response = await api.post('/auth/register');

        return {
            success: true,
            user: response.data.data.user,
            firebaseUser: userCredential.user
        };

    } catch (error) {
        console.error('Register error:', error);

        // Friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Email already in use. Please login or use a different email.');
        }

        if (error.code === 'auth/weak-password') {
            throw new Error('Password is too weak. Please use at least 6 characters.');
        }

        if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address.');
        }

        throw error;
    }
};

/**
 * Login với Google
 */
export const loginWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);

        // Sync với backend
        const response = await api.post('/auth/login');

        return {
            success: true,
            user: response.data.data.user,
            firebaseUser: userCredential.user
        };

    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
};

/**
 * Logout
 */
export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

/**
 * Forgot Password
 */
export const forgotPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Password reset email sent'
        };
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

/**
 * Get current user from backend
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/users/me');
        return response.data.data.user;
    } catch (error) {
        console.error('Get current user error:', error);
        throw error;
    }
};

export default {
    login,
    register,
    loginWithGoogle,
    logout,
    forgotPassword,
    getCurrentUser
};