/**
 * Server.js - Entry point của Express backend
 * 
 * Chức năng:
 * 1. Khởi tạo Express application
 * 2. Cấu hình middleware (CORS, JSON parser)
 * 3. Đăng ký routes (API endpoints)
 * 4. Kết nối MongoDB
 * 5. Start server và lắng nghe requests
 * 
 * Tech stack:
 * - Express: Web framework
 * - Mongoose: MongoDB ODM
 * - CORS: Cho phép frontend gọi API từ domain khác
 * - dotenv: Load biến môi trường từ .env file
 */
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './config/database.js'
// Import routers
import authRouter from './routes/auth.js'
import accountRouter from './routes/accounts.js'
import transactionsRouter from './routes/transactions.js'
import usersRouter from './routes/users.js'
import balanceRouter from './routes/balance.js'
// import categoriesRouter from './routes/categories.js'
// import accountsRouter from './routes/accounts.js'
// import walletsRouter from './routes/wallets.js'
// import invitationsRouter from './routes/invitations.js'
// import budgetsRouter from './routes/budgets.js'
// import goalsRouter from './routes/goals.js'
// import reportsRouter from './routes/reports.js'

// Import MiddleWare
import auth from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import bodyParser from 'body-parser'

// Khởi tạo Express app
dotenv.config();
const app = express();

/**
 * Middleware: CORS (Cross-Origin Resource Sharing)
 * Cho phép frontend (localhost:5173) gọi API từ backend (localhost:4000)
 * Trong production, nên giới hạn origin cụ thể thay vì allow all
 */
app.use(cors());
app.use(morgan('dev'));
/**
 * Middleware: JSON Parser
 * Parse request body dạng JSON thành JavaScript object
 * Truy cập qua req.body trong controllers
 */
app.use(bodyParser.json());

/**
 * Đăng ký routes (API endpoints)
 * Tất cả endpoints đều có prefix /api để phân biệt với frontend routes
 */
app.use('/api/auth', authRouter)                  // Authentication (login, register, logout)
// Compatibility alias (some clients call endpoints without the /api prefix)
app.use('/auth', authRouter)
app.use('/api/accounts', accountRouter)            // Account management (profile sync)
app.use('/api/transactions', transactionsRouter)  // Quản lý giao dịch thu/chi (M1-06, M1-07)
app.use('/api/users', usersRouter)                // Quản lý người dùng (M1-04)
app.use('/api/balance', balanceRouter)            // Quản lý balance tổng hợp (Wallet + Budget + Saving Goal)
// app.use('/api/categories', categoriesRouter)      // Quản lý danh mục
// app.use('/api/accounts', accountsRouter)          // Quản lý tài khoản/ví
// app.use('/api/wallets', walletsRouter)            // Quản lý ví tiền (Use Cases U010-U014)
// app.use('/api/invitations', invitationsRouter)    // Quản lý lời mời ví chia sẻ (Use Case U011)
// app.use('/api/budgets', budgetsRouter)            // Quản lý ngân sách (Budgets)
// app.use('/api/goals', goalsRouter)                // Quản lý mục tiêu tiết kiệm (Saving Goals)
// app.use('/api/reports', reportsRouter)            // Báo cáo tổng hợp (Reports)

app.use(errorHandler);
/**
 * Health check endpoint
 * Dùng để kiểm tra server có đang chạy không
 * Hữu ích khi deploy lên cloud (health check, monitoring)
 */
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Port mặc định 4000, có thể override bằng biến môi trường PORT
const PORT = process.env.PORT || 4000

/**
 * Function khởi động server
 * 
 * Flow:
 * 1. Kết nối MongoDB (await mongoose.connect)
 * 2. Nếu kết nối thành công, start Express server
 * 3. Nếu thất bại, log error và exit process
 */
async function start() {
  // Lấy MongoDB URI từ .env hoặc dùng local MongoDB
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover'

  try {
    connectDB();
    // Start server và lắng nghe requests
    app.listen(PORT, () => console.log('Server running on port', PORT))
  } catch (err) {
    console.error('Failed to start', err)
    process.exit(1)  // Exit với code 1 (error)
  }
}

// Gọi function start() để khởi động server
start()
