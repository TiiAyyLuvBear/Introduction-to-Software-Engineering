# Money Lover Clone - Personal Finance Management App

Ứng dụng quản lý tài chính cá nhân được xây dựng với React, Express.js, MongoDB và Firebase Authentication.

## 🎯 Tính năng

### ✅ Đã Implement
- **Authentication**: Đăng ký/Đăng nhập với Firebase Auth (Email/Password, Google)
- **Dashboard**: Tổng quan thu chi, biểu đồ, giao dịch gần đây
- **Wallets Management**: 
  - Tạo/sửa/xóa ví tiền (Cash, Bank, Savings)
  - Shared wallets: Mời thành viên, phân quyền, chuyển quyền sở hữu
- **Transactions**: Ghi nhận thu/chi, phân loại theo category
- **Categories**: Quản lý danh mục thu/chi
- **Budget Tracking**: Đặt ngân sách cho từng category
- **Saving Goals**: Đặt mục tiêu tiết kiệm
- **Reports**: Báo cáo tài chính, biểu đồ thống kê
- **Chatbot**: AI assistant hỗ trợ người dùng

### 🚧 Đang phát triển
- Notifications
- Export to Excel/PDF
- Multi-currency support
- Recurring transactions
- Bill reminders

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite 7.2.6** - Build tool
- **TailwindCSS 4.1.17** - Styling
- **Lucide React 0.553.0** - Icons
- **React Router DOM 7.9.5** - Routing
- **React Hook Form 7.67.0** - Form management
- **Framer Motion 12.23.25** - Animations
- **Firebase SDK** - Client-side authentication

### Backend
- **Express.js 4.18.2** - Web framework
- **MongoDB (Mongoose 7.0.0)** - Database
- **Firebase Admin SDK** - Server-side auth verification
- **JWT (jsonwebtoken)** - Token management
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
IntroToSE_Final_Project/
│
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Chatbot.jsx
│   │   │   ├── SharedWallet.jsx
│   │   │   ├── Sidebar.jsx (Navbar)
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Wallets.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── SavingGoals.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── ...
│   │   ├── api.js              # API client
│   │   ├── firebase.js         # Firebase config
│   │   └── App.jsx             # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Express.js API server
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── firebase.js         # Firebase Admin SDK
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── walletsController.js
│   │   ├── transactionsController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js            # Firebase token verification
│   │   └── errorHandler.js    # Global error handling
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   ├── Transaction.js
│   │   ├── Budget.js
│   │   └── SavingGoal.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── wallets.js
│   │   ├── transactions.js
│   │   └── ...
│   ├── utils/
│   │   └── response.js        # Response formatters
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   ├── API_DOCUMENTATION.md    # API docs
│   ├── IMPLEMENTATION_GUIDE.md # Setup guide
│   └── BACKEND_SUMMARY.md      # Architecture overview
│
├── docs/                        # Documentation
│
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 16.x
- **MongoDB** (local or Atlas)
- **Firebase Project** (for authentication)

### Backend Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd IntroToSE_Final_Project/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` với credentials của bạn:
   ```env
   MONGODB_URI=mongodb://localhost:27017/moneylover
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   
   # Firebase Admin
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```
   
   Server chạy tại: http://localhost:5000

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   
   Edit `src/firebase.js` với Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     // ...
   }
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```
   
   App chạy tại: http://localhost:5173

## 📖 Documentation

### Backend
- **[API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Chi tiết về API endpoints, models, authentication flow
- **[IMPLEMENTATION_GUIDE.md](backend/IMPLEMENTATION_GUIDE.md)** - Hướng dẫn triển khai từng bước
- **[BACKEND_SUMMARY.md](backend/BACKEND_SUMMARY.md)** - Tóm tắt cấu trúc và kiến trúc backend

### Frontend
- Component documentation trong từng file
- UI design inspired by Money Lover app

## 🔐 Authentication Flow

```
1. User Sign In (Frontend)
   ├─> Firebase Auth (Email/Password or Google)
   └─> Receive Firebase ID Token

2. API Requests (Frontend → Backend)
   ├─> Attach token: Authorization: Bearer <firebase-token>
   └─> Backend middleware verifies token with Firebase Admin SDK

3. Database Sync (Backend)
   ├─> Verify token với Firebase
   ├─> Find/Create user trong MongoDB
   └─> Attach req.user cho controllers
```

## 🗄️ Database Schema

### Collections

**Users**
- firebaseUid (unique)
- email, name, avatar
- phone, address, birthday, bio

**Wallets**
- userId (owner)
- name, type, balance, currency
- isShared, members[], invitations[]

**Transactions**
- userId, walletId, categoryId
- type (income/expense), amount, date, note

**Categories**
- userId (null for default)
- name, type, color, icon

**Budgets**
- userId, categoryId
- amount, period, spent
- startDate, endDate

**SavingGoals**
- userId, walletId
- name, targetAmount, currentAmount
- deadline, contributions[]

## 🎨 UI Features

- **Gradient backgrounds** - Modern, colorful design
- **Hover effects** - Interactive transitions
- **Loading animations** - Smooth loading states with rotating icons
- **Responsive design** - Mobile-friendly navbar và layouts
- **Icons** - Professional icon library (Lucide React)
- **Charts** - Biểu đồ thống kê thu chi
- **Chatbot** - AI assistant ở góc dưới phải (ngoại trừ Accounts & Abouts pages)

## 🧪 Testing

### Backend API Testing
Sử dụng Postman hoặc Thunder Client:

```
# Test Authentication
POST http://localhost:5000/api/auth/verify
Body: { "idToken": "<firebase-token>" }

# Test Create Wallet
POST http://localhost:5000/api/wallets
Headers: Authorization: Bearer <firebase-token>
Body: { "name": "My Cash", "type": "Cash", "initialBalance": 1000000 }

# Test Get Wallets
GET http://localhost:5000/api/wallets
Headers: Authorization: Bearer <firebase-token>
```

## 🔧 Development

### Run both Frontend & Backend
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Code Style
- Backend: ES Modules (import/export)
- Frontend: React Hooks, Functional Components
- Comments: Vietnamese for clarity

## 🚀 Deployment

### Backend
- Deploy to: Heroku, Railway, Render, or AWS
- Set environment variables
- Connect to MongoDB Atlas

### Frontend
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or Firebase Hosting

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/verify          - Verify Firebase token
GET    /api/auth/me              - Get current user
PUT    /api/auth/profile         - Update profile
DELETE /api/auth/account         - Delete account
```

### Wallets
```
GET    /api/wallets              - List wallets
POST   /api/wallets              - Create wallet
GET    /api/wallets/:id          - Get wallet
PUT    /api/wallets/:id          - Update wallet
DELETE /api/wallets/:id          - Delete wallet
POST   /api/wallets/:id/invite   - Invite member
POST   /api/wallets/:id/leave    - Leave wallet
```

### Transactions
```
GET    /api/transactions         - List transactions
POST   /api/transactions         - Create transaction
PUT    /api/transactions/:id     - Update transaction
DELETE /api/transactions/:id     - Delete transaction
```

### More endpoints: See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

## 🐛 Troubleshooting

### Firebase Token Issues
```javascript
// Frontend: Force refresh token
const auth = getAuth()
const token = await auth.currentUser.getIdToken(true)
```

### MongoDB Connection Issues
```env
# Use 127.0.0.1 instead of localhost
MONGODB_URI=mongodb://127.0.0.1:27017/moneylover
```

### CORS Issues
Backend `server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

## 👥 Team

- Nhóm sinh viên HCMUS
- Môn: Introduction to Software Engineering
- Học kỳ 7, Năm 3

## 📄 License

This is a student project for educational purposes.

## 🙏 Acknowledgments

- Inspired by **Money Lover** app design
- Firebase Authentication
- MongoDB & Mongoose
- React & Vite communities

---

**Built with ❤️ by HCMUS students**
