import Category from '../models/Category.js'
import mongoose from 'mongoose'

/**
 * Controller: Lấy danh sách categories (có phân trang)
 * 
 * Endpoint: GET /api/categories?page=1&limit=20
 * 
 * Sort: Theo tên (A-Z) để dễ tìm
 * Use case: Hiển thị dropdown chọn category khi tạo transaction
 * 
 * TODO: Thêm filter theo type (income/expense) và userId
 */
export async function getCategories(req, res){
  try{
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit
    
    // Sort theo name (alphabetically) thay vì createdAt
    const [items, total] = await Promise.all([
      Category.find().sort({name:1}).skip(skip).limit(limit),
      Category.countDocuments()
    ])
    res.json({ items, total, page, limit })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Lấy chi tiết 1 category
 * 
 * Endpoint: GET /api/categories/:id
 * 
 * Use case: Xem thông tin category trước khi edit
 */
export async function getCategory(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const c = await Category.findById(id)
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json(c)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Tạo category mới
 * 
 * Endpoint: POST /api/categories
 * 
 * Body: { name, type, color?, userId? }
 * 
 * Validation:
 * - name và type bắt buộc
 * - type chỉ nhận 'income' hoặc 'expense'
 * 
 * Use case:
 * - User tạo category riêng (VD: "Học phí", "Chi tiền nhà")
 * - Admin tạo category chung cho tất cả users
 */
export async function createCategory(req, res){
  try{
    const { name, type, color, userId } = req.body
    
    // Validate required fields
    if(!name || !type) return res.status(400).json({ error: 'Missing fields' })
    
    // Validate type enum
    if(!['income','expense'].includes(type)) return res.status(400).json({ error: 'Invalid type' })
    
    const cat = new Category({ name, type, color, userId })
    await cat.save()
    res.status(201).json(cat)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Cập nhật category
 * 
 * Endpoint: PUT /api/categories/:id
 * 
 * Body: { name?, type?, color? } (tất cả optional)
 * 
 * Use case: Đổi tên, màu sắc hoặc chuyển type của category
 */
export async function updateCategory(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    
    const updates = req.body
    const c = await Category.findByIdAndUpdate(id, updates, { new: true })
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json(c)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Xóa category
 * 
 * Endpoint: DELETE /api/categories/:id
 * 
 * TODO: Cảnh báo nếu category đang được dùng bởi transactions
 * Có thể:
 * - Chặn xóa nếu có transactions liên quan
 * - Hoặc set category = null cho các transactions đó
 */
export async function deleteCategory(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const c = await Category.findByIdAndDelete(id)
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
