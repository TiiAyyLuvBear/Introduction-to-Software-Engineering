import mongoose from 'mongoose'

/**
 * User Schema - Định nghĩa cấu trúc dữ liệu cho người dùng trong hệ thống
 * 
 * Schema này lưu trữ thông tin cơ bản của người dùng và sẽ được dùng để:
 * - Xác thực đăng nhập (authentication)
 * - Phân quyền dữ liệu (mỗi user chỉ thấy transactions/accounts của mình)
 * - Liên kết với các collections khác (transactions, categories, accounts)
 */
const UserSchema = new mongoose.Schema({
  // Tên hiển thị của người dùng
  name: { type: String, required: true },
  
  // Email dùng để đăng nhập, phải unique (không trùng lặp)
  // lowercase: tự động convert sang chữ thường
  // trim: loại bỏ khoảng trắng đầu/cuối
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  
  // Mật khẩu - nên được hash bằng bcrypt trước khi lưu (sẽ implement sau)
  password: { type: String, required: true },

  // Optional Firebase UID (when authenticated via Firebase)
  firebaseUid: { type: String, index: true, sparse: true },

  // Profile fields
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },

  // Password reset (self-managed when Firebase email reset isn't used)
  resetPasswordTokenHash: { type: String },
  resetPasswordExpiresAt: { type: Date },

  // Session invalidation (increment to revoke prior JWTs)
  tokenVersion: { type: Number, default: 0 },
}, { 
  // timestamps: true tự động thêm createdAt và updatedAt
  timestamps: true 
})

/**
 * Export model User
 * Model này cung cấp các methods để tương tác với collection 'users' trong MongoDB:
 * - User.find() - Tìm nhiều users
 * - User.findById() - Tìm user theo ID
 * - User.create() - Tạo user mới
 * - User.findByIdAndUpdate() - Cập nhật user
 * - User.findByIdAndDelete() - Xóa user
 */
export default mongoose.model('User', UserSchema)
