# HƯỚNG DẪN IMPLEMENTATION BACKEND

## 🚀 Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

Package đã có:
- express: Web framework
- mongoose: MongoDB ODM
- cors: Cross-origin requests
- dotenv: Environment variables
- bcryptjs: Password hashing (optional nếu dùng Firebase Auth)
- jsonwebtoken: JWT tokens (optional nếu dùng Firebase Auth)

**Package mới thêm:**
- firebase-admin: ^12.0.0

```bash
npm install firebase-admin
```

## 🔧 Bước 2: Setup Environment Variables

Tạo file `.env` trong folder `backend/`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/moneylover
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moneylover

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Optional: Path to Firebase service account JSON
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Lấy Firebase Credentials:

1. Vào Firebase Console: https://console.firebase.google.com
2. Chọn project của bạn
3. Settings ⚙️ > Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download JSON file
6. Copy các giá trị vào `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## 📁 Bước 3: Cấu trúc Files Đã Tạo

### Config Files
```
backend/config/
├── database.js     ✅ MongoDB connection với Mongoose
└── firebase.js     ✅ Firebase Admin SDK initialization
```

### Utils
```
backend/utils/
└── response.js     ✅ Helper functions để format response
```

### Middleware
```
backend/middleware/
├── auth.js         ✅ Firebase token verification (ĐÃ CẬP NHẬT)
└── errorHandler.js ✅ Global error handling
```

### Models (Đã có sẵn + mới thêm)
```
backend/models/
├── User.js         ✅ Schema có sẵn
├── Wallet.js       ✅ Schema có sẵn (đã update shared wallet features)
├── Transaction.js  ✅ Schema có sẵn
├── Category.js     ✅ Schema có sẵn
├── Invitation.js   ✅ Schema có sẵn
├── Budget.js       ✅ MỚI TẠO - Budget management
└── SavingGoal.js   ✅ MỚI TẠO - Saving goals tracking
```

### Controllers (Cần cập nhật)
```
backend/controllers/
├── authController.js        ⚠️ CẦN CẬP NHẬT cho Firebase Auth
├── usersController.js       ⚠️ CẦN CẬP NHẬT
├── walletsController.js     ✅ ĐÃ IMPLEMENT đầy đủ
├── transactionsController.js ⚠️ CẦN CẬP NHẬT
├── categoriesController.js  ⚠️ CẦN CẬP NHẬT
├── accountsController.js    ⚠️ CẦN CẬP NHẬT
├── budgetsController.js     ❌ CẦN TẠO MỚI
└── savingsController.js     ❌ CẦN TẠO MỚI
```

### Routes (Cần cập nhật)
```
backend/routes/
├── auth.js          ⚠️ CẬP NHẬT endpoints
├── users.js         ⚠️ CẬP NHẬT endpoints
├── wallets.js       ✅ ĐÃ CÓ đầy đủ
├── transactions.js  ⚠️ CẬP NHẬT endpoints
├── categories.js    ⚠️ CẬP NHẬT endpoints
├── accounts.js      ⚠️ CẬP NHẬT endpoints
├── budgets.js       ❌ TẠO MỚI
├── savings.js       ❌ TẠO MỚI
├── reports.js       ❌ TẠO MỚI
└── invitations.js   ✅ ĐÃ CÓ
```

## 🔄 Bước 4: Update server.js

File `server.js` hiện tại cần import:
1. Config files mới (database.js, firebase.js)
2. Error handler middleware
3. Chuyển từ ES modules sang CommonJS hoặc ngược lại (check package.json)

**File hiện tại dùng ES modules** (type: "module" trong package.json)

Cần thêm imports:
```javascript
import { connectDB } from './config/database.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Ở đầu start function
await connectDB()

// Ở cuối routes (before app.listen)
app.use(notFoundHandler)
app.use(errorHandler)
```

## 🎯 Bước 5: Luồng Authentication Chi Tiết

### Frontend Authentication Flow:

```javascript
// 1. User đăng ký/đăng nhập qua Firebase
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

const auth = getAuth()

// Login with Email
const userCredential = await signInWithEmailAndPassword(auth, email, password)
const user = userCredential.user
const idToken = await user.getIdToken()

// Login with Google
const provider = new GoogleAuthProvider()
const result = await signInWithPopup(auth, provider)
const idToken = await result.user.getIdToken()

// 2. Gửi token đến backend để verify và sync với MongoDB
const response = await fetch('http://localhost:5000/api/auth/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ idToken })
})

const data = await response.json()
// data.data.user = { _id, firebaseUid, email, name, ... }

// 3. Lưu token và user info
localStorage.setItem('firebaseToken', idToken)
localStorage.setItem('user', JSON.stringify(data.data.user))

// 4. Attach token vào mọi API request
const apiCall = await fetch('http://localhost:5000/api/wallets', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
})
```

### Backend Authentication Flow:

```
Request → authenticate middleware → verify Firebase token → find/create user in MongoDB → attach req.user → controller
```

**Chi tiết trong authenticate middleware:**
1. Extract token từ `Authorization: Bearer <token>` header
2. Verify token với Firebase Admin SDK: `firebaseAuth.verifyIdToken(token)`
3. Lấy `uid`, `email`, `name` từ decoded token
4. Tìm user trong MongoDB by `firebaseUid`
5. Nếu không tồn tại → Tạo user mới
6. Attach user object vào `req.user` để controller dùng

## 📊 Bước 6: API Endpoints Structure

### Authentication Endpoints

```
POST /api/auth/verify
- Body: { idToken: string }
- Response: { user: {...} }
- Purpose: Verify Firebase token và sync với MongoDB

GET /api/auth/me
- Headers: Authorization: Bearer <token>
- Response: { user: {...} }
- Purpose: Lấy thông tin user hiện tại

PUT /api/auth/profile
- Headers: Authorization: Bearer <token>
- Body: { name, phone, address, birthday, bio, avatar }
- Response: { user: {...} }
- Purpose: Cập nhật profile

DELETE /api/auth/account
- Headers: Authorization: Bearer <token>
- Purpose: Xóa account và toàn bộ dữ liệu
```

### Wallets Endpoints (ĐÃ IMPLEMENT)

```
GET /api/wallets
- Headers: Authorization: Bearer <token>
- Query: ?status=active
- Response: { wallets: [...], totalBalance, walletCount }

POST /api/wallets
- Headers: Authorization: Bearer <token>
- Body: { name, type, initialBalance, currency, description }
- Response: { wallet: {...} }

GET /api/wallets/:id
PUT /api/wallets/:id
DELETE /api/wallets/:id

POST /api/wallets/:id/invite (Invite member)
POST /api/wallets/:id/leave (Leave wallet)
POST /api/wallets/:id/transfer-ownership
GET /api/wallets/:id/members
DELETE /api/wallets/:id/members/:memberId
PUT /api/wallets/:id/members/:memberId/permission
```

### Transactions Endpoints (CẦN CẬP NHẬT)

```
GET /api/transactions
- Query: ?userId, ?type, ?category, ?walletId, ?startDate, ?endDate, ?page, ?limit
- Response: { transactions: [...], pagination: {...} }

POST /api/transactions
- Body: { walletId, categoryId, type, amount, date, note }
- Auto update wallet balance

PUT /api/transactions/:id
DELETE /api/transactions/:id

POST /api/transactions/transfer
- Body: { fromWalletId, toWalletId, amount, note }
- Create 2 transactions (expense + income)
```

### Categories Endpoints (CẦN CẬP NHẬT)

```
GET /api/categories
- Query: ?type=income|expense
- Response: { categories: [...] }

POST /api/categories
- Body: { name, type, color }

PUT /api/categories/:id
DELETE /api/categories/:id
```

### Budgets Endpoints (CẦN TẠO)

```
GET /api/budgets
POST /api/budgets
GET /api/budgets/:id
PUT /api/budgets/:id
DELETE /api/budgets/:id
GET /api/budgets/:id/progress
```

### Saving Goals Endpoints (CẦN TẠO)

```
GET /api/savings
POST /api/savings
GET /api/savings/:id
PUT /api/savings/:id
DELETE /api/savings/:id
POST /api/savings/:id/contribute
```

### Reports Endpoints (CẦN TẠO)

```
GET /api/reports/summary?startDate=...&endDate=...
- Income vs Expense summary

GET /api/reports/by-category?startDate=...&endDate=...
- Spending grouped by category

GET /api/reports/by-wallet
- Balance per wallet

GET /api/reports/trends?period=monthly
- Spending trends over time
```

## 🔍 Bước 7: Testing Flow

### Test 1: MongoDB Connection
```bash
npm start
# Check console: "MongoDB connected successfully"
```

### Test 2: Firebase Connection
```bash
# Add console.log in config/firebase.js
# Should log: "Firebase Admin initialized successfully"
```

### Test 3: API với Postman/Thunder Client

**1. Verify Token (POST /api/auth/verify)**
```json
{
  "idToken": "<your-firebase-id-token>"
}
```
Expected: User object created/returned

**2. Get Current User (GET /api/auth/me)**
```
Header: Authorization: Bearer <firebase-token>
```
Expected: User info

**3. Create Wallet (POST /api/wallets)**
```json
{
  "name": "My Cash",
  "type": "Cash",
  "initialBalance": 1000000
}
```
Expected: Wallet created

**4. Get Wallets (GET /api/wallets)**
```
Header: Authorization: Bearer <token>
```
Expected: Array of wallets

## ⚠️ Common Issues & Solutions

### Issue 1: Firebase token expired
```javascript
// Frontend: Auto refresh token
const auth = getAuth()
auth.currentUser.getIdToken(true) // force refresh
```

### Issue 2: CORS error
```javascript
// server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
```

### Issue 3: MongoDB connection timeout
```
MONGODB_URI=mongodb://127.0.0.1:27017/moneylover
// Use 127.0.0.1 instead of localhost
```

### Issue 4: Firebase private key format
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLine1\nLine2\n-----END PRIVATE KEY-----\n"
// Must include \n for newlines
```

## 📝 Next Steps

1. ✅ Đã tạo: Config files, middleware, models, utils
2. ⚠️ Cần làm: Cập nhật controllers để dùng response helpers
3. ⚠️ Cần làm: Cập nhật routes để dùng authenticate middleware
4. ❌ Cần làm: Tạo budgets & savings controllers + routes
5. ❌ Cần làm: Tạo reports endpoints
6. ❌ Cần làm: Update frontend để gọi API thay vì mockdata
7. ❌ Cần làm: Implement file upload cho avatar (optional)
8. ❌ Cần làm: Add pagination cho list endpoints
9. ❌ Cần làm: Add data validation middleware
10. ❌ Cần làm: Write API tests

## 🎓 Tài liệu tham khảo

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [RESTful API Design](https://restfulapi.net/)

## 📧 Support

Nếu gặp vấn đề, check:
1. Console logs trong terminal
2. Network tab trong browser DevTools
3. MongoDB logs: `mongod --dbpath /path/to/data`
4. Firebase Console > Authentication > Users
