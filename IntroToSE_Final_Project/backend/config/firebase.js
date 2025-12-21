/**
 * Firebase Admin Configuration
 * 
 * Chức năng:
 * - Initialize Firebase Admin SDK
 * - Verify ID tokens từ client
 * - Quản lý user authentication
 * 
 * Luồng xử lý:
 * 1. Import firebase-admin
 * 2. Đọc credentials từ .env (hoặc service account JSON)
 * 3. Initialize app với credentials
 * 4. Export auth instance để verify tokens
 * 
 * Sử dụng:
 * - Middleware sẽ dùng auth.verifyIdToken() để validate Firebase token
 * - Lấy user info từ decoded token
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
// Option 1: Using environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Option 2: Using service account file (more secure for production)
// const serviceAccount = require('./serviceAccountKey.json');

try {
  // Only initialize if credentials are present
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️  Firebase Admin not initialized (missing FIREBASE_* env vars)');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

// Export auth instance
export const auth = admin.apps?.length ? admin.auth() : null;

export default admin;
