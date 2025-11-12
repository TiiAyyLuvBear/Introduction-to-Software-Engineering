import Account from '../models/Account.js'
import mongoose from 'mongoose'

/**
 * Controller: Lấy danh sách accounts (có phân trang)
 * 
 * Endpoint: GET /api/accounts?page=1&limit=20
 * 
 * Use case:
 * - Hiển thị tất cả ví/tài khoản của user
 * - Tính tổng balance để hiển thị trên dashboard
 * - Dropdown chọn account khi tạo transaction
 */
export async function getAccounts(req, res){
  try{
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit
    
    // Sort theo tên để dễ tìm
    const [items, total] = await Promise.all([
      Account.find().sort({name:1}).skip(skip).limit(limit),
      Account.countDocuments()
    ])
    res.json({ items, total, page, limit })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Lấy chi tiết 1 account
 * 
 * Endpoint: GET /api/accounts/:id
 * 
 * Use case: Xem balance và thông tin account trước khi edit
 */
export async function getAccount(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const a = await Account.findById(id)
    if(!a) return res.status(404).json({ error: 'Not found' })
    res.json(a)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Tạo account mới
 * 
 * Endpoint: POST /api/accounts
 * 
 * Body: { name, balance?, currency?, userId? }
 * 
 * Use case:
 * - Thêm ví tiền mặt (Cash)
 * - Thêm tài khoản ngân hàng (Vietcombank, ACB, ...)
 * - Thêm thẻ tín dụng (Credit Card)
 * - Thêm ví điện tử (Momo, ZaloPay)
 * 
 * Balance mặc định = 0 nếu không truyền
 */
export async function createAccount(req, res){
  try{
    const { name, balance, currency, userId } = req.body
    
    // Chỉ validate name (bắt buộc), các field khác có default
    if(!name) return res.status(400).json({ error: 'Missing name' })
    
    const acct = new Account({ name, balance: balance || 0, currency: currency || 'USD', userId })
    await acct.save()
    res.status(201).json(acct)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Cập nhật account
 * 
 * Endpoint: PUT /api/accounts/:id
 * 
 * Body: { name?, balance?, currency? }
 * 
 * Use case:
 * - Đổi tên account
 * - Điều chỉnh balance (reconciliation - đối chiếu số dư)
 * - Đổi currency
 * 
 * Note: Balance thường được cập nhật tự động khi thêm/xóa transactions
 * Chỉ edit manual khi cần điều chỉnh (VD: sai số, quên ghi transaction cũ)
 */
export async function updateAccount(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    
    const updates = req.body
    const a = await Account.findByIdAndUpdate(id, updates, { new: true })
    if(!a) return res.status(404).json({ error: 'Not found' })
    res.json(a)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Controller: Xóa account
 * 
 * Endpoint: DELETE /api/accounts/:id
 * 
 * TODO: Cảnh báo nếu account có transactions
 * Có 2 approach:
 * 1. Chặn xóa nếu có transactions liên quan
 * 2. Xóa account và set account=null cho các transactions
 * 
 * Hiện tại: Cho phép xóa tự do (approach 2)
 */
export async function deleteAccount(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const a = await Account.findByIdAndDelete(id)
    if(!a) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
