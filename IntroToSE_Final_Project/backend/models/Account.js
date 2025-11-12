import mongoose from 'mongoose'

/**
 * Account Schema - Định nghĩa tài khoản/ví tiền
 * 
 * Mỗi user có thể có nhiều account (ví) khác nhau:
 * - Tiền mặt (Cash)
 * - Tài khoản ngân hàng (Bank Account)
 * - Thẻ tín dụng (Credit Card)
 * - Ví điện tử (E-wallet)
 * 
 * Mỗi transaction sẽ liên kết với 1 account
 * Balance được cập nhật tự động khi thêm/xóa transactions
 */
const AccountSchema = new mongoose.Schema({
  // Tên tài khoản (VD: "Cash", "Vietcombank", "Momo Wallet")
  name: { type: String, required: true },
  
  // Số dư hiện tại của tài khoản
  // default: 0 nghĩa là khi tạo mới không cần truyền balance
  balance: { type: Number, default: 0 },
  
  // Loại tiền tệ (VD: "USD", "VND", "EUR")
  currency: { type: String, default: 'USD' },
  
  // ID của user sở hữu tài khoản này
  // Liên kết với User model để phân quyền dữ liệu
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true })

/**
 * Export model Account
 * Controllers sử dụng để:
 * - Hiển thị danh sách accounts và tổng balance
 * - Tạo account mới
 * - Cập nhật balance khi có transaction
 * - Chuyển tiền giữa các accounts
 */
export default mongoose.model('Account', AccountSchema)
