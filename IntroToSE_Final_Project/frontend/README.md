# Frontend (Vite + React)

Quick start:

cd frontend
npm install
npm run dev

The frontend expects the backend API at http://localhost:4000/api

Firebase password reset
- Install dependencies: `npm install` will include `firebase`.
- Create a `.env` (at `frontend/.env`) with your Firebase config using Vite env names:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

- In the Firebase Console -> Authentication -> Templates, ensure the Password Reset template points to your app URL (for development, `http://localhost:3000`) so the reset email includes an `oobCode` query param that the frontend will consume.
- The app includes a "Forgot Password" link on the login screen which sends a reset email via Firebase. When the user clicks the link, the app reads the `oobCode` from the URL and shows a reset form to set a new password.
