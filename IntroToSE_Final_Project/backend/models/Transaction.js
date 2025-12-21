import mongoose from 'mongoose'

/**
 * Transaction Schema - Định nghĩa giao dịch thu/chi
 * 
 * Đây là model chính của ứng dụng, lưu trữ mọi giao dịch tài chính:
 * - Thu nhập: Lương, thưởng, bán hàng, lãi đầu tư
 * - Chi tiêu: Mua sắm, ăn uống, hóa đơn, học phí
 * 
 * Mỗi transaction liên kết với:
 * - User (người tạo)
 * - Category (danh mục)
 * - Account (tài khoản/ví)
 */
const TransactionSchema = new mongoose.Schema({
  // ID của user sở hữu transaction này
  // Dùng để filter: mỗi user chỉ thấy transactions của mình
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Ví thực hiện giao dịch
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },

  // Danh mục (reference)
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false, index: true },
  
  // Số tiền giao dịch (luôn là số dương, type quyết định +/-)
  amount: { type: Number, required: true },
  
  // Loại giao dịch: 'income' (tiền vào) hoặc 'expense' (tiền ra)
  type: { type: String, enum: ['income','expense'], required: true },
  
  // Danh mục phân loại (VD: "Food", "Salary", "Transportation")
  // Hiện tại lưu string, có thể nâng cấp thành ObjectId reference
  category: { type: String },
  
  // Tài khoản thực hiện giao dịch (VD: "Cash", "Bank Account")
  account: { type: String },
  
  // Ngày thực hiện giao dịch
  // default: Date.now tự động lấy thời gian hiện tại nếu không truyền
  date: { type: Date, default: Date.now },
  
  // Ghi chú thêm về giao dịch (tùy chọn)
  note: { type: String }
}, { timestamps: true })

TransactionSchema.index({ userId: 1, walletId: 1, date: -1 })
TransactionSchema.index({ userId: 1, categoryId: 1, date: -1 })

/**
 * Export model Transaction
 * Controller sử dụng để:
 * - Lấy danh sách transactions (có filter, pagination)
 * - Tạo transaction mới và cập nhật account balance
 * - Tính tổng thu/chi theo tháng/năm
 * - Thống kê chi tiêu theo category
 */
export default mongoose.model('Transaction', TransactionSchema)
