# Money Lover (Frontend)

This is a Vite + React + Tailwind single-page app.

## Run

```bash
cd IntroToSE_Final_Project/frontend
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Notes

- Backend API base URL is configured via `VITE_API_BASE_URL` (defaults to `http://localhost:4000/api`).
	- Example: create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:4000/api`
- Auth/session is stored in `localStorage`: `ml_access_token`, `ml_refresh_token`, `ml_user`.
