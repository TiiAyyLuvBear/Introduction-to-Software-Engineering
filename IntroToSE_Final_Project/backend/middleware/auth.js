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

/**
 * MIDDLEWARE: Authenticate (Required)
 * 
 * Verify Firebase ID token và require authentication
 * Nếu không có token hoặc token invalid → return 401
 * 
 * Usage trong routes:
 * router.get('/protected', authenticate, controller)
 * 
 * Sau khi pass middleware, req.user sẽ có:
 * {
 *   _id: MongoDB ObjectId,
 *   firebaseUid: Firebase UID,
 *   email: User email,
 *   name: Display name
 * }
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Lấy token từ Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'No token provided. Header must be: Authorization: Bearer <token>')
    }
    
    // 2. Extract token (bỏ prefix 'Bearer ')
    const idToken = authHeader.substring(7)
    
    if (!idToken) {
      return sendUnauthorized(res, 'Token is empty')
    }
    
<<<<<<< Updated upstream
    // 3. Verify token với Firebase Admin SDK
    // Nếu token valid, Firebase trả về decoded token chứa user info
=======
    // 3) Try verify as our own JWT first (used by /api/auth/*)
    try {
      const decoded = jwt.verify(idToken, JWT_SECRET)
      if (decoded?.type !== 'access' || !decoded?.id) throw new Error('Not an access token')
      const user = await User.findById(decoded.id).select('-password')
      if (!user) return sendUnauthorized(res, 'User not found')

      // Token version check: allows invalidating old sessions (e.g., after password reset)
      if ((user.tokenVersion || 0) !== (decoded.v || 0)) {
        return sendUnauthorized(res, 'Token expired. Please login again.')
      }

      req.user = {
        id: String(user._id),
        _id: user._id,
        email: user.email,
        name: user.name,
        firebaseUid: user.firebaseUid || null,
      }
      return next()
    } catch {
      // Not a valid project JWT -> fallback to Firebase
    }

    // 4) Verify token with Firebase Admin SDK
    if (!firebaseAuth) {
      return sendUnauthorized(
        res,
        'Firebase auth is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or use JWT login.'
      )
    }

>>>>>>> Stashed changes
    let decodedToken
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken)
    } catch (firebaseError) {
      console.error('Firebase token verification failed:', firebaseError.message)
      
      if (firebaseError.code === 'auth/id-token-expired') {
        return sendUnauthorized(res, 'Token expired. Please login again.')
      }
      
      if (firebaseError.code === 'auth/argument-error') {
        return sendUnauthorized(res, 'Invalid token format')
      }
      
      return sendUnauthorized(res, 'Invalid token')
    }
    
    // 4. Lấy Firebase UID và email từ decoded token
    const { uid: firebaseUid, email, name: firebaseName } = decodedToken
    
    if (!firebaseUid || !email) {
      return sendUnauthorized(res, 'Token missing required fields (uid or email)')
    }
    
    // 5. Tìm hoặc tạo user trong MongoDB
    // Sync Firebase user với MongoDB database
    let user = await User.findOne({ firebaseUid })
    
    if (!user) {
      // User chưa tồn tại trong MongoDB → Tạo mới
      user = await User.create({
        firebaseUid,
        email,
        name: firebaseName || email.split('@')[0]
      })
      
      console.log('Created new user in MongoDB:', { firebaseUid, email })
    }
    
    // 6. Attach user object vào request
    // Controllers có thể access thông qua req.user
    req.user = {
      _id: user._id,           // MongoDB ObjectId
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name
    }
    
    // 7. Continue đến controller
    next()
    
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return sendServerError(res, 'Authentication failed')
  }
}

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
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    // Nếu không có auth header, skip authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null
      return next()
    }
    
    const idToken = authHeader.substring(7)
    
    if (!idToken) {
      req.user = null
      return next()
    }
    
    // Try verify token
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken)
      const { uid: firebaseUid, email, name: firebaseName } = decodedToken
      
      if (firebaseUid && email) {
        let user = await User.findOne({ firebaseUid })
        
        if (!user) {
          user = await User.create({
            firebaseUid,
            email,
            name: firebaseName || email.split('@')[0]
          })
        }
        
        req.user = {
          _id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name
        }
      } else {
        req.user = null
      }
    } catch (firebaseError) {
      // Token invalid, nhưng không block request
      console.log('Optional auth: Token invalid, continuing as guest')
      req.user = null
    }
    
    next()
    
  } catch (error) {
    // Có lỗi xảy ra, nhưng vẫn cho pass với guest mode
    console.error('Optional authentication error:', error)
    req.user = null
    next()
  }
}
