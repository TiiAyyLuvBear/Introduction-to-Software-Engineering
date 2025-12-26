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
// Option 1: Using environment variables
const serviceAccount = {
  "type": "service_account",
  "project_id": "se-4-money",
  "private_key_id": "3e6ea4834e5959ca0e53cfadc1a0bd465230d38f",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXbFh3c+tzHeNb\njbIoxIshW/GZtRP581YFkdplLbxI4lpo6jlbDJ+ZACuqb5dxUl0HXU57JB7BVdTx\nfJfzdqYglPbHlluadA8u1bXS31dj8IS8l8q9ZgyCgOwXMymVFyLes9Pbi9iHym2q\nyAgAVuxFkrJW3aLxREMrkC8jRaxIUF1pA0oamidCDUcdx7CpymWX2li901UdL3x0\n8yuY40MbHOzMOnjgidD6HRQbd29TecowFlsDV/G0Q1uY3NSfmzdOB8KJ5napUr5G\nRVI8cguZPOgti9YFhBkw9TFTk77maDIalN3DbozZX9r8W1J5btB0aWzXPKTJT4v0\nbdcNJBNHAgMBAAECggEAC6jxpP0dn8co5zdhhSchSYfRclMRvzkAIjypcwoTCg+4\nA4Uptnuh3H+5XQ3rvPOpKzSBoxTUc3G/DHtaHgrAXxjpadQHqLyQILyfHCZLjewK\n5JTRrUTq6K+xvlWXuZ3G9xwkz66UlVw+lpyBlTkcR30002CMuARYIcYgAxjN2+GK\nBTQ+YkbXuvX0pBwrHNVwRN/xHGXc4UrD51HThOWtr0q8DZSCJdr9LbGzdYe5sm+l\nv2DX7azYu/k83dJK4ADO1mgQw3heq0ILOlpj9hMSvPzm2aHFxhfV92U1lQ1HPvaJ\nacqWXtRBl2QCt37thPQQg7CwXzv5+jZarG2n+ELqRQKBgQDGasYrCxH00DTeCNNU\ne1V/1OnEfGbldDAdzLJBtDD0rgG74u22Bn7iFjXAnu61WElCO2ntQ1xMeyNz1Mes\ne+m21LU9u98Yz/YmwY7rl+jAi9LvBYW22Z2rBAX0SPAhHdCjbM1o+HbTOFbOh5kQ\nesDj9Rrq6V+ryJRGpjXwcgkW5QKBgQDDXjQC2tBbi2cnkCHgm36OV0ImnVgud22+\nlHu3QVdyrErVLcElPvwk6BHHIpVloyibsA8a2+uYMfKwcZ2oD57+f1AtOIAkuPx8\n6quUc7vnccXMsPvhIz7SQCbP9m5WKx4EzueVl8bGwpy9CmzUp/sISI+DOgOQ7KBW\n/s/cxM9SuwKBgQC2vMPCBLIG7HKkQzCO0AAQeUDK61/A118xMsLBbHjiABgsuHUB\nfb4B7z6WJknmzma6DwohsDYjYg1msoMrQfwfnItHTe3MZktnqkA8jm2YV65u4IEj\nxAxH4q6xKzOs7E6pFJ2hnaOiKHMaRxwbZ1KbH7QowcKQ7WxSHOX0irIAWQKBgQCt\nz+eyCn6Ik3OIzUB2laB4fsVJmX7UiEhI381ZcnacfRBurLBDtM+a/iSi5+/GZuw/\n5tjpanMmCnoB5HMBDDTF8vqf4L6Q7Uskz5srDfREqwHxZBwTZsoDQDPHnVT4sI+a\nc4Gxo0CjoIzV2qqMX46FBhk4BKsbion0G+tOXIKe9QKBgFXpRUYGUMLfNJcytvkw\nj5KDC8RNhD/WI0mYy7tD63xkbfq0oxbKibo/tFZoThnG5HPLcBF290Xl6oRvbgZy\nnTHZXAHxAsfYtqtINt6Kbva/QuftyXZRUpr7q1ypcAqj6QHvD16HWkeAmmTuROxm\nvhcPmguM3RHZQO3ynM+H6eFn\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@se-4-money.iam.gserviceaccount.com",
  "client_id": "114250103519914337836",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40se-4-money.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
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
