# Backend API Documentation

## Cấu trúc Backend

```
backend/
├── config/                 # Cấu hình database, firebase
│   ├── database.js        # MongoDB connection
│   └── firebase.js        # Firebase Admin SDK
├── controllers/           # Business logic xử lý requests
│   ├── authController.js  # Authentication logic
│   ├── usersController.js # User management
│   ├── walletsController.js # Wallet CRUD
│   ├── transactionsController.js
│   ├── categoriesController.js
│   ├── budgetsController.js
│   ├── savingsController.js
│   └── reportsController.js
├── middleware/            # Middleware functions
│   ├── auth.js           # Verify Firebase token
│   ├── validation.js     # Validate request data
│   └── errorHandler.js   # Global error handling
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Wallet.js
│   ├── Transaction.js
│   ├── Category.js
│   ├── Budget.js
│   ├── SavingGoal.js
│   └── Invitation.js
├── routes/               # API route definitions
│   ├── auth.js
│   ├── users.js
│   ├── wallets.js
│   ├── transactions.js
│   ├── categories.js
│   ├── budgets.js
│   ├── savings.js
│   ├── reports.js
│   └── invitations.js
├── utils/                # Helper functions
│   ├── validation.js     # Data validation helpers
│   └── response.js       # Response formatters
├── .env                  # Environment variables
├── .env.example         # Environment template
├── package.json
└── server.js            # Entry point
```

## Luồng xử lý Request-Response

### 1. Authentication Flow (Firebase + MongoDB)

```
Client (Frontend)
    │
    ├─> Firebase Authentication (Google, Email/Password)
    │   └─> Firebase returns ID Token
    │
    └─> POST /api/auth/verify { idToken: "..." }
           │
           ├─> Middleware: auth.js verifyIdToken()
           │   └─> Firebase Admin verifies token
           │   └─> Extract uid, email, name
           │
           ├─> Controller: authController.js
           │   └─> Find/Create user in MongoDB
           │   └─> Sync Firebase user with MongoDB
           │
           └─> Response: { success: true, user: {...} }
```

### 2. Wallet Operations Flow

```
Client Request: GET /api/wallets
    │
    ├─> Middleware: authenticate
    │   └─> Verify Firebase token
    │   └─> Attach req.user
    │
    ├─> Route: routes/wallets.js
    │   └─> router.get('/', authenticate, getWallets)
    │
    ├─> Controller: walletsController.js
    │   ├─> Query MongoDB: Wallet.find({ userId })
    │   ├─> Apply filters, pagination
    │   └─> Format response data
    │
    └─> Response: { success: true, data: { wallets: [...] } }
```

### 3. Transaction Operations Flow

```
Client Request: POST /api/transactions
Body: { amount, type, category, walletId, date, note }
    │
    ├─> Middleware: authenticate
    │   └─> Verify user authentication
    │
    ├─> Middleware: validateTransaction
    │   └─> Validate request body
    │   └─> Check required fields
    │
    ├─> Controller: transactionsController.js
    │   ├─> Create transaction in MongoDB
    │   ├─> Update wallet balance
    │   ├─> Check budget limits
    │   ├─> Update saving goals progress
    │   └─> Return created transaction
    │
    └─> Response: { success: true, data: { transaction: {...} } }
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/avatar` - Update avatar

### Wallets
- `GET /api/wallets` - List user's wallets
- `POST /api/wallets` - Create new wallet
- `GET /api/wallets/:id` - Get wallet details
- `PUT /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet
- `GET /api/wallets/:id/members` - Get wallet members
- `POST /api/wallets/:id/invite` - Invite member to shared wallet

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction detail
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/transfer` - Transfer between wallets

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget details
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/progress` - Get budget spending progress

### Saving Goals
- `GET /api/savings` - List saving goals
- `POST /api/savings` - Create saving goal
- `PUT /api/savings/:id` - Update saving goal
- `DELETE /api/savings/:id` - Delete saving goal
- `POST /api/savings/:id/contribute` - Add contribution to goal

### Reports
- `GET /api/reports/summary` - Financial summary (income/expense/balance)
- `GET /api/reports/by-category` - Report grouped by category
- `GET /api/reports/by-wallet` - Report grouped by wallet
- `GET /api/reports/trends` - Spending trends over time

### Invitations
- `GET /api/invitations` - List pending invitations
- `POST /api/invitations/:id/accept` - Accept invitation
- `POST /api/invitations/:id/reject` - Reject invitation

## Database Models

### User Model
```javascript
{
  firebaseUid: String (unique),
  email: String (unique, required),
  name: String,
  avatar: String,
  phone: String,
  address: String,
  birthday: Date,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallet Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String (required),
  type: String (Cash/Bank/Savings),
  balance: Number (default: 0),
  currency: String (default: 'USD'),
  description: String,
  isShared: Boolean (default: false),
  members: [{
    userId: ObjectId,
    role: String (owner/edit/view),
    joinedAt: Date
  }],
  status: String (active/archived),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  walletId: ObjectId (ref: Wallet),
  categoryId: ObjectId (ref: Category),
  type: String (income/expense),
  amount: Number (required),
  date: Date (required),
  note: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  userId: ObjectId (ref: User, null for default categories),
  name: String (required),
  type: String (income/expense),
  color: String,
  icon: String,
  isDefault: Boolean (default: false),
  createdAt: Date
}
```

### Budget Model
```javascript
{
  userId: ObjectId (ref: User),
  categoryId: ObjectId (ref: Category),
  amount: Number (required),
  period: String (daily/weekly/monthly/yearly),
  startDate: Date,
  endDate: Date,
  spent: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### SavingGoal Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String (required),
  targetAmount: Number (required),
  currentAmount: Number (default: 0),
  deadline: Date,
  description: String,
  status: String (active/completed/cancelled),
  contributions: [{
    amount: Number,
    date: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables (.env)

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/moneylover

# Server
PORT=5000
NODE_ENV=development

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# CORS
FRONTEND_URL=http://localhost:5173
```

## Error Handling

Tất cả API responses follow format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication failed)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate data)
- 500: Internal Server Error
