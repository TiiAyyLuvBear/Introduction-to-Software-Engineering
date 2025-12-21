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
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit

    const type = req.query.type
    if(type && !['income','expense'].includes(type)){
      return res.status(400).json({ error: 'Invalid type' })
    }

    const filter = {
      $or: [
        { isDefault: true },
        { userId },
      ]
    }
    if(type) filter.type = type
    
    // Sort theo name (alphabetically) thay vì createdAt
    const [items, total] = await Promise.all([
      Category.find(filter).sort({name:1}).skip(skip).limit(limit),
      Category.countDocuments(filter)
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
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const c = await Category.findById(id)
    if(!c) return res.status(404).json({ error: 'Not found' })

    if(!c.isDefault && c.userId?.toString() !== userId.toString()){
      return res.status(403).json({ error: 'Forbidden' })
    }
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
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { name, type, color, icon } = req.body
    
    // Validate required fields
    if(!name || !type) return res.status(400).json({ error: 'Missing fields' })
    
    // Validate type enum
    if(!['income','expense'].includes(type)) return res.status(400).json({ error: 'Invalid type' })
    
    const cat = new Category({ name, type, color, icon, userId, isDefault: false })
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
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    
    const existing = await Category.findById(id)
    if(!existing) return res.status(404).json({ error: 'Not found' })
    if(existing.isDefault) return res.status(403).json({ error: 'Default categories cannot be edited' })
    if(existing.userId?.toString() !== userId.toString()) return res.status(403).json({ error: 'Forbidden' })

    const updates = {}
    for(const key of ['name','type','color','icon']){
      if(req.body[key] !== undefined) updates[key] = req.body[key]
    }
    if(updates.type && !['income','expense'].includes(updates.type)){
      return res.status(400).json({ error: 'Invalid type' })
    }

    const c = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
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
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const c = await Category.findById(id)
    if(!c) return res.status(404).json({ error: 'Not found' })
    if(c.isDefault) return res.status(403).json({ error: 'Default categories cannot be deleted' })
    if(c.userId?.toString() !== userId.toString()) return res.status(403).json({ error: 'Forbidden' })

    await Category.findByIdAndDelete(id)
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
