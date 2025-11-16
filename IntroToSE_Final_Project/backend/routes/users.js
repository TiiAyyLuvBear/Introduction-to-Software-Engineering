/**
 * Routes: User endpoints
 * 
 * Base path: /api/users
 * 
 * Định nghĩa các REST API endpoints cho User resource:
 * - GET    /api/users          -> Lấy danh sách users (có pagination)
 * - GET    /api/users/:id      -> Lấy chi tiết 1 user
 * - POST   /api/users          -> Tạo user mới (đăng ký)
 * - PUT    /api/users/:id      -> Cập nhật thông tin user
 * - DELETE /api/users/:id      -> Xóa user
 * 
 * Router được đăng ký trong server.js:
 * app.use('/api/users', usersRouter)
 */
import express from 'express'
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/usersController.js'

const router = express.Router()

// GET /api/users - Lấy danh sách users
router.get('/', getUsers)

// GET /api/users/:id - Lấy thông tin 1 user
router.get('/:id', getUser)

// POST /api/users - Tạo user mới
router.post('/', createUser)

// PUT /api/users/:id - Cập nhật user
router.put('/:id', updateUser)

// DELETE /api/users/:id - Xóa user
router.delete('/:id', deleteUser)

export default router
