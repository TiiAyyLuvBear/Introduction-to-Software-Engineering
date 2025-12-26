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
import dotenv from 'dotenv';
// Initialize Firebase Admin

dotenv.config();

// Option 1: Using environment variables (RECOMMENDED for security)
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
}



// Option 2: Using service account file (more secure for production)
// const serviceAccount = require('./serviceAccountKey.json');

try {
  // Only initialize if credentials are present
  if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
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
