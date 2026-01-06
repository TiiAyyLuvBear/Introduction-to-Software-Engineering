// TODO: M1-04 - User Profile API
// Người khác sẽ implement:
// - POST /api/auth/sync-user (Lưu user khi login lần đầu)
// - GET /api/auth/me (Lấy thông tin user)
// - PUT /api/auth/me (Cập nhật profile)
import {
    sendSuccess,
    sendBadRequest,
    sendUnauthorized,
    sendServerError,
    sendCreated
} from "../utils/response.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    } catch (error) {
        console.warn('Firebase Admin initialization skipped:', error.message);
    }
}

/**
 * Generate JWT access token
 */
function generateAccessToken(userId) {
    return jwt.sign(
        { id: userId, type: 'access' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
    );
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(userId) {
    return jwt.sign(
        { id: userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

/**
 * Controller: Login
 * API: POST /api/auth/login
 * @param {Object} req - Request object with { token, email, password }
 * @param {Object} res - Response object
 * @returns {Object} JSON response containing user info and tokens
 */
export const login = async (req, res) => {
    try {
        const { token, email, password } = req.body;

        if (!token || !email) {
            return sendBadRequest(res, 'Token and email are required');
        }

        // Verify Firebase token
        let firebaseUser;
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            firebaseUser = decodedToken;
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            return sendUnauthorized(res, 'Invalid Firebase token');
        }

        // Find or create user in MongoDB
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user if doesn't exist
            user = new User({
                _id: firebaseUser.uid, // Use Firebase UID as MongoDB _id
                email,
                name: firebaseUser.name || email.split('@')[0],
                firebaseUid: firebaseUser.uid,
                passWordHash: password || 'firebase-auth' // Not used for Firebase auth
            });
            await user.save();
        }

        // Generate JWT tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        return sendSuccess(res, {
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
            accessToken,
            refreshToken
        }, 'Login successfully');
    } catch (error) {
        console.error('[AUTH CONTROLLER] Login error:', error);
        return sendServerError(res, 'Login failed');
    }
};

/**
 * Controller: Register
 * API: POST /api/auth/register
 * @param {Object} req - Request object with { token, email, password, name }
 * @param {Object} res - Response object
 * @returns {Object} JSON response containing user info and tokens
 */
export const register = async (req, res) => {
    try {
        const { token, email, password, name } = req.body;

        if (!token || !email || !name) {
            return sendBadRequest(res, 'Token, email, and name are required');
        }

        // Verify Firebase token
        let firebaseUser;
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            firebaseUser = decodedToken;
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            return sendUnauthorized(res, 'Invalid Firebase token');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendBadRequest(res, 'User already exists');
        }

        // Create new user
        const user = new User({
            _id: firebaseUser.uid, // Use Firebase UID as MongoDB _id
            email,
            name,
            firebaseUid: firebaseUser.uid,
            passWordHash: password || 'firebase-auth'
        });
        await user.save();

        // Generate JWT tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        return sendCreated(res, {
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
            accessToken,
            refreshToken
        }, 'Register successfully');
    } catch (error) {
        console.error('[AUTH CONTROLLER] Register error:', error);
        return sendServerError(res, 'Register failed');
    }
};

export default {
    login,
    register
};
