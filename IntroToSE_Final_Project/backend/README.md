# Backend (Express + Mongoose)

Steps to run:

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install dependencies:

   cd backend
   npm install

3. Run dev server (nodemon):

   npm run dev

API endpoints

Auth
- Most endpoints require `Authorization: Bearer <token>`.
- Token can be either:
   - App JWT (issued by `/api/auth/login`), or
   - Firebase ID token (if Firebase Admin is configured).

Core
- GET `/api/health`
- Auth: `/api/auth/*`
- Users: `/api/users/me`, `/api/users/sync-user`
- Wallets: `/api/wallets/*`
- Transactions: `/api/transactions/*` (includes `POST /api/transactions/transfer`)
- Budgets: `/api/budgets/*`
- Goals: `/api/goals/*`
- Reports: `/api/reports/summary`, `/api/reports/by-category`, `/api/reports/by-wallet`

Secrets / Hidden keys (how to get them)

MongoDB (`MONGODB_URI`)
- Local: install MongoDB, then use `mongodb://localhost:27017/moneylover`
- Atlas: create a free cluster → "Connect" → "Drivers" → copy the connection string.

JWT (`JWT_SECRET`)
- Generate a strong secret (Linux/macOS):
   - `openssl rand -base64 48`
- Put the output into `JWT_SECRET` in your `.env`.

Firebase Admin (optional, for Firebase token verification)
- Go to Firebase Console → your project → Project settings → Service accounts.
- Click "Generate new private key" → download JSON.
- Set these env vars from the JSON:
   - `FIREBASE_PROJECT_ID`  ← `project_id`
   - `FIREBASE_CLIENT_EMAIL` ← `client_email`
   - `FIREBASE_PRIVATE_KEY`  ← `private_key`

Important: `FIREBASE_PRIVATE_KEY` formatting
- If your `private_key` contains newlines, store it with `\n` escapes in `.env`.
- Example (do NOT commit real keys):
   - `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
