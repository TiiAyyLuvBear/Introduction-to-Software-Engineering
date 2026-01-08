/**
 * AUTHENTICATION MIDDLEWARE - JWT ONLY
 * 
 * Middleware này xác thực user bằng JWT Token (do backend tạo)
 * 
 * LUỒNG XỬ LÝ:
 * 1. Client login qua Firebase → Backend verify Firebase token
 * 2. Backend tạo JWT token và trả về client
 * 3. Client lưu JWT token vào localStorage
 * 4. Client gửi request kèm header: Authorization: Bearer <jwt-token>
 * 5. Middleware verify JWT token
 * 6. Attach user vào req.user để controllers sử dụng
 * 
 * NOTE: Firebase CHỈ dùng cho login/register, KHÔNG dùng cho API authorization
 */

import { sendUnauthorized } from '../utils/response.js'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * MIDDLEWARE: Authenticate (Required)
 * 
 * Verify JWT token và require authentication
 * Nếu không có token hoặc token invalid → return 401
 * 
 * Usage trong routes:
 * router.get('/protected', authenticate, controller)
 * 
 * Sau khi pass middleware, req.user sẽ có:
 * {
 *   id: String (user ID),
 *   _id: MongoDB ObjectId,
 *   email: User email,
 *   name: Display name,
 *   firebaseUid: Firebase UID (optional)
 * }
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Lấy token từ Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'No token provided');
    }
    
    // 2. Extract token (bỏ prefix 'Bearer ')
    const token = authHeader.substring(7);
    console.log("[MIDDLEWARE ACCESS TOKEN]: ", token);
    
    if (!token) {
      return sendUnauthorized(res, 'Token is empty')
    }
    
    // 3. Verify JWT token
    let decoded;
    try {
      console.log("[MIDDLEWARE] Verifying token with JWT_SECRET:", JWT_SECRET);
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("[MIDDLEWARE] Token verified successfully!");
    } catch (error) {
      console.log("[MIDDLEWARE] JWT Verification Error:");
      console.log("  - Error name:", error.name);
      console.log("  - Error message:", error.message);
      console.log("  - JWT_SECRET used:", JWT_SECRET);
      console.log("  - Token (first 50 chars):", token.substring(0, 50));
      
      if (error.name === 'TokenExpiredError') {
        return sendUnauthorized(res, 'Token expired')
      }
      if (error.name === 'JsonWebTokenError') {
        return sendUnauthorized(res, 'Invalid token')
      }
      return sendUnauthorized(res, 'Token verification failed')
    }
    
    // 4. Validate token type
    if (decoded?.type !== 'access' || !decoded?.id) {
      return sendUnauthorized(res, 'Invalid token type')
    }
    
    // 5. Find user in database
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return sendUnauthorized(res, 'User not found')
    }
    
    // 6. Attach user to request
    req.user = {
      id: String(user._id),
      _id: user._id,
      email: user.email,
      name: user.name,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatarURL: user.avatarURL,
      roles: user.roles
    }
    
    // 7. Continue đến controller
    next()
    
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return sendServerError(res, 'Authentication failed')
  }
}

export default authenticate;
/**
 * MIDDLEWARE: Optional Authenticate
 * 
 * Tương tự authenticate nhưng KHÔNG block request nếu không có token
 * Dùng cho routes có thể access bởi cả authenticated và guest users
 * 
 * Nếu có token valid → attach req.user
 * Nếu không có token hoặc invalid → req.user = null và vẫn pass
 * 
 * Usage:
 * router.get('/public-but-personalized', optionalAuthenticate, controller)
 * 
 * Controller check:
 * if (req.user) {
 *   // User logged in, show personalized content
 * } else {
 *   // Guest user, show default content
 * }
 */
// export const optionalAuthenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization
    
//     // Nếu không có auth header, skip authentication
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       req.user = null
//       return next()
//     }
    
//     const idToken = authHeader.substring(7)
    
//     if (!idToken) {
//       req.user = null
//       return next()
//     }
    
//     // Try verify token (JWT first)
//     try {
//       const decoded = jwt.verify(idToken, JWT_SECRET)
//       if (decoded?.type === 'access' && decoded?.id) {
//         const user = await User.findById(decoded.id).select('-password')
//         if (user) {
//           req.user = {
//             id: String(user._id),
//             _id: user._id,
//             email: user.email,
//             name: user.name,
//             firebaseUid: user.firebaseUid || null,
//           }
//           return next()
//         }
//       }
//     } catch {
//       // ignore
//     }

//     // Firebase fallback
//     if (!firebaseAuth) {
//       req.user = null
//       return next()
//     }

//     try {
//       const decodedToken = await firebaseAuth.verifyIdToken(idToken)
//       const { uid: firebaseUid, email, name: firebaseName } = decodedToken

//       if (firebaseUid && email) {
//         let user = await User.findOne({ firebaseUid })

//         if (!user) {
//           user = await User.create({
//             firebaseUid,
//             email,
//             name: firebaseName || email.split('@')[0],
//           })
//         }

//         req.user = {
//           id: String(user._id),
//           _id: user._id,
//           firebaseUid: user.firebaseUid,
//           email: user.email,
//           name: user.name,
//         }
//       } else {
//         req.user = null
//       }
//     } catch {
//       console.log('Optional auth: Token invalid, continuing as guest')
//       req.user = null
//     }
    
//     next()
    
//   } catch (error) {
//     // Có lỗi xảy ra, nhưng vẫn cho pass với guest mode
//     console.error('Optional authentication error:', error)
//     req.user = null
//     next()
//   }
// }
