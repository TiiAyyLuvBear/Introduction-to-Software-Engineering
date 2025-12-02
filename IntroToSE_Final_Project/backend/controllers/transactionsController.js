import Transaction from '../models/Transaction.js'

/**
 * Controller: Lấy danh sách transactions
 * 
 * Endpoint: GET /api/transactions
 * 
 * Sort: Theo ngày mới nhất (date descending)
 * Limit: 200 transactions gần nhất
 * 
 * TODO: Thêm pagination, filter theo:
 * - userId (chỉ lấy transactions của user hiện tại)
 * - type (income/expense)
 * - category
 * - account
 * - date range (từ ngày X đến ngày Y)
 * 
 * Use case:
 * - Dashboard: Hiển thị 5-10 transactions gần nhất
 * - Transactions page: Hiển thị tất cả với filter
 * - Reports: Tính tổng thu/chi theo tháng/năm
 */
export async function getTransactions(req, res){
  try{
    // Sort theo date giảm dần (-1) để lấy mới nhất
    const list = await Transaction.find().sort({date:-1}).limit(200)
    res.json(list)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

/**
 * Controller: Tạo transaction mới
 * 
 * Endpoint: POST /api/transactions
 * 
 * Body: { amount, type, category?, account?, date?, note? }
 * 
 * Validation:
 * - amount phải là số (number)
 * - type chỉ nhận 'income' hoặc 'expense'
 * 
 * Flow:
 * 1. Validate input
 * 2. Tạo transaction mới
 * 3. Lưu vào database
 * 4. TODO: Cập nhật balance của account tương ứng
 *    - Nếu income: account.balance += amount
 *    - Nếu expense: account.balance -= amount
 * 
 * Use case:
 * - Ghi nhận khoản thu (lương, thưởng, bán hàng)
 * - Ghi nhận khoản chi (mua sắm, ăn uống, hóa đơn)
 */
export async function createTransaction(req, res){
  try{
    const { amount, type, category, account, date, note } = req.body
    
    // Validate amount và type
    if(typeof amount !== 'number' || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
    
    const tx = new Transaction({ amount, type, category, account, date, note })
    await tx.save()
    res.status(201).json(tx)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

/**
 * Controller: Xóa transaction
 * 
 * Endpoint: DELETE /api/transactions/:id
 * 
 * TODO: Khi xóa transaction, cần điều chỉnh lại balance của account:
 * - Nếu xóa income: account.balance -= amount
 * - Nếu xóa expense: account.balance += amount
 * 
 * Use case:
 * - Xóa transaction nhập nhầm
 * - Xóa transaction trùng
 * - Undo sau khi ghi sai
 */
export async function deleteTransaction(req, res){
  try{
    const { id } = req.params
    const t = await Transaction.findByIdAndDelete(id)
    if(!t) return res.status(404).json({error: 'Not found'})
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

export async function updateTransaction(req, res){
  try{
    const { id } = req.params
    const { amount, type, category, account, date, note } = req.body
    if(typeof amount !== 'number' || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
    const updated = await Transaction.findByIdAndUpdate(
      id,
      { amount, type, category, account, date, note },
      { new: true }
    )
    if(!updated) return res.status(404).json({error: 'Not found'})
    res.json(updated)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}
