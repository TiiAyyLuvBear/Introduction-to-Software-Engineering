/**
 * Express Server - Main Entry Point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import walletRoutes from './routes/wallets.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import reportRoutes from './routes/reports.js';
import balanceRoutes from './routes/balance.js';
import invitationRoutes from './routes/invitations.js';
import { seedDefaultCategories } from './utils/seedDefaultCategories.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARE
// ============================================

// Morgan - HTTP request logger (dev mode)
app.use(morgan('dev'));

// CORS - Allow frontend to call API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser - Parse JSON request body
app.use(express.json());

// Body parser - Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
// Alias for spec naming: /api/report/*
app.use('/api/report', reportRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/invitations', invitationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed default categories (idempotent) on startup
    try {
      await seedDefaultCategories();
    } catch (seedErr) {
      console.error('Default category seed failed:', seedErr);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();