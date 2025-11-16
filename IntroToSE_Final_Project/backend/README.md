# Backend (Express + Mongoose)

Steps to run:

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install dependencies:

   cd backend
   npm install

3. Run dev server (nodemon):

   npm run dev

API endpoints
- GET /api/transactions — list recent transactions
- POST /api/transactions — create transaction
- DELETE /api/transactions/:id — delete

Next steps: add auth (users), pagination, validation, and more models (Categories, Accounts).