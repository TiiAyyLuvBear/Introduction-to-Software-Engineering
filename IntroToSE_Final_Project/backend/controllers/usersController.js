import User from '../models/User.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(String(email || '').trim())
}

function validatePasswordComplexity(password) {
  const s = String(password || '')
  if (s.length < 8) return { ok: false, message: 'Password must be at least 8 characters long' }
  if (!/[^A-Za-z0-9]/.test(s)) return { ok: false, message: 'Password must include at least 1 special character' }
  return { ok: true }
}

/**
 * Controller: Lấy danh sách users (có phân trang)
 * 
 * Endpoint: GET /api/users?page=1&limit=20
 * 
 * Query params:
 * - page: Trang hiện tại (mặc định 1)
 * - limit: Số items mỗi trang (mặc định 20, tối đa 100)
 * 
 * Response: { items: [], total: 100, page: 1, limit: 20 }
 * 
 * Note: .select('-password') loại bỏ password khỏi kết quả (bảo mật)
 */
export async function getUsers(req, res) {
  try {
    // Parse và validate pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1)  // Tối thiểu trang 1
    const limit = Math.min(100, parseInt(req.query.limit) || 20)  // Tối đa 100 items
    const skip = (page - 1) * limit  // Số items cần bỏ qua

    // Chạy song song 2 queries để tăng hiệu suất:
    // 1. Lấy users của trang hiện tại (sort theo mới nhất)
    // 2. Đếm tổng số users (để tính tổng số trang)
    const [items, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
      User.countDocuments()
    ])

    // Trả về JSON với metadata để frontend hiển thị pagination
    res.json({ items, total, page, limit })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Lấy thông tin chi tiết 1 user theo ID
 * 
 * Endpoint: GET /api/users/:id
 * 
 * Params:
 * - id: MongoDB ObjectId của user
 * 
 * Response: User object (không có password)
 * Error: 400 (Invalid ID), 404 (Not found), 500 (Server error)
 */
export async function getUser(req, res) {
  try {
    const { id } = req.params

    // Validate ID format (MongoDB ObjectId có format đặc biệt)
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    // Tìm user và loại bỏ password
    const u = await User.findById(id).select('-password')
    if (!u) return res.status(404).json({ error: 'Not found' })

    res.json(u)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Tạo user mới (đăng ký)
 * 
 * Endpoint: POST /api/users
 * 
 * Body: { name, email, password }
 * 
 * Flow:
 * 1. Validate input (name, email, password bắt buộc)
 * 2. Kiểm tra email đã tồn tại chưa
 * 3. Tạo user mới và lưu vào database
 * 4. Trả về user (không có password)
 * 
 * TODO: Hash password bằng bcrypt trước khi lưu (hiện lưu plain text)
 */
export async function createUser(req, res) {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' })
    const pwCheck = validatePasswordComplexity(password)
    if (!pwCheck.ok) return res.status(400).json({ error: pwCheck.message })

    // Kiểm tra email đã được sử dụng chưa
    // NOTE: password should be hashed when adding auth; storing plain text only for scaffold/demo
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already in use' })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(String(password), salt)

    // Tạo và lưu user mới
    const u = new User({ name: String(name).trim(), email: String(email).toLowerCase().trim(), password: hashedPassword })
    await u.save()

    // Loại bỏ password trước khi trả về client
    const safe = u.toObject()
    delete safe.password

    res.status(201).json(safe)  // 201 = Created
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Cập nhật thông tin user
 * 
 * Endpoint: PUT /api/users/:id
 * 
 * Body: { name?, email?, password? } (tất cả optional)
 * 
 * Special handling:
 * - Nếu đổi email, kiểm tra email mới có bị trùng không
 * - Không cho phép đổi email thành email của user khác
 * 
 * Response: User đã cập nhật (không có password)
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    const updates = { ...req.body }

    // Nếu có đổi email, kiểm tra xem email mới đã được dùng chưa
    // $ne: id nghĩa là "not equal" - loại trừ user hiện tại
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: id } })
      if (exists) return res.status(409).json({ error: 'Email already in use' })
    }

    // findByIdAndUpdate với { new: true } trả về document sau khi update
    const u = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password')
    if (!u) return res.status(404).json({ error: 'Not found' })

    res.json(u)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Xóa user
 * 
 * Endpoint: DELETE /api/users/:id
 * 
 * TODO: Khi xóa user, nên xóa hoặc chuyển ownership của:
 * - Transactions
 * - Categories
 * - Accounts
 * 
 * Hiện tại chỉ xóa user, dữ liệu liên quan vẫn còn
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    // Xóa user
    const u = await User.findByIdAndDelete(id)
    if (!u) return res.status(404).json({ error: 'Not found' })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
