/**
 * AUTHENTICATION MIDDLEWARE - FIREBASE AUTH
 * 
 * Middleware này xác thực user bằng Firebase ID Token
 * 
 * LUỒNG XỬ LÝ:
 * 1. Client đăng nhập qua Firebase (Google, Email/Password)
 * 2. Firebase trả về ID Token
 * 3. Client gửi request kèm header: Authorization: Bearer <firebase-id-token>
 * 4. Middleware verify token với Firebase Admin SDK
 * 5. Nếu valid, lấy user info và sync với MongoDB
 * 6. Attach user vào req.user để controllers sử dụng
 */

import { auth as firebaseAuth } from '../config/firebase.js'
import { sendUnauthorized, sendServerError } from '../utils/response.js'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    // 0. Check if Firebase is initialized
    if (!firebaseAuth) {
      console.error('Firebase Admin SDK not initialized');
      return sendServerError(res, 'Authentication service unavailable. Please contact administrator.');
    }

    // 1. Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);

    if (!token) {
      return sendUnauthorized(res, 'Token is empty');
    }

    // 2. Verify với Firebase
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // 3. Extract user info từ decoded token
    const { uid, email, name, picture } = decodedToken;

    if (!uid || !email) {
      return sendUnauthorized(res, 'Token missing required fields');
    }

    // 4. Tìm hoặc tạo user trong MongoDB
    console.log('Looking for user with uid:', uid);
    let user = await User.findById(uid);

    if (!user) {
      console.log('User not found, creating new user...');
      try {
        user = await User.create({
          _id: uid,  // Dùng Firebase UID làm MongoDB _id
          email: email,
          name: name || email.split('@')[0],
          avatarURL: picture || null
        });

        console.log('✅ Created new user:', { uid, email });
      } catch (createError) {
        // Nếu lỗi duplicate, có thể user vừa được tạo bởi request khác
        if (createError.code === 11000) {
          console.log('⚠️  User already exists (race condition), fetching...');
          user = await User.findById(uid);
          if (!user) {
            throw new Error('User exists but cannot be found');
          }
        } else {
          throw createError;
        }
      }
    } else {
      console.log('✅ Found existing user:', { uid, email: user.email });
    }

    // 5. Gán req.user
    req.user = user;

    // 6. Continue đến controller
    next();

  } catch (error) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      return sendUnauthorized(res, 'Token expired. Please login again.');
    }

    if (error.code === 'auth/argument-error') {
      return sendUnauthorized(res, 'Invalid token format');
    }

    return sendServerError(res, 'Authentication failed');
  }
};
