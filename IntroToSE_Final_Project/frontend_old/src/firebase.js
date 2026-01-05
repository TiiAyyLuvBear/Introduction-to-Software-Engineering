import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Replace the following config values with your Firebase project settings.
// Prefer using environment variables in production (e.g. VITE_ prefixed for Vite).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '<FIREBASE_API_KEY>',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '<FIREBASE_PROJECT_ID>',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '<FIREBASE_APP_ID>'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export default app
