/**
 * Firebase Admin SDK Configuration (Backend)
 * 
 * Dùng để verify ID tokens từ frontend
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load service account from file
let serviceAccount;
let firebaseInitialized = false;

try {
  const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
  console.log(serviceAccountPath);
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  console.log('Loaded Firebase serviceAccountKey.json');

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized');
  firebaseInitialized = true;

} catch (error) {
  console.log('Firebase not initialized - serviceAccountKey.json not found');
  console.log('Authentication will not work until you add the service account key');
  console.log('Download from: https://console.firebase.google.com/project/se-4-money/settings/serviceaccounts/adminsdk');
}

// Export auth instance (will be null if not initialized)
export const auth = firebaseInitialized ? admin.auth() : null;
export default admin;
