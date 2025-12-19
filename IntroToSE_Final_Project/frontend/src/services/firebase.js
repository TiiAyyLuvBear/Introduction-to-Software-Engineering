import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

/**
 * Firebase Configuration
 * 
 * Best Practice: Sử dụng environment variables (VITE_*)
 * Fallback: Hardcoded values cho development
 * 
 * Lưu ý: Firebase API key là PUBLIC và an toàn để expose.
 * Security được bảo vệ bởi Firebase Authentication và Security Rules.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCuxetKnCRpm4sCBRWcpuTfqTtdmEJwNMk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "se-4-money.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "se-4-money",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "se-4-money.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "132985259368",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:132985259368:web:aed705f3f1fd24fd98c2dd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6L3XEBR0BD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export auth instance để sử dụng trong app
export const auth = getAuth(app)

export default app
