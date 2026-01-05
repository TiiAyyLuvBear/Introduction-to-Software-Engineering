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

  // Số điện thoại (Optional, Unique)
  phoneNumber: { 
    type: String, 
    unique: true, 
    sparse: true, // Cho phép nhiều user có phoneNumber là null
    trim: true,
    minLength: [10, 'Phone number must be at least 10 digits'],
    maxLength: [11, 'Phone number must be at most 11 digits']
  },

  // Avatar URL
  avatarUrl: { 
    type: String, 
    trim: true,
    // Simple URL validation regex or logic could be added here
    match: [/^(http|https):\/\/[^ "]+$/, 'Please provide a valid URL for avatar']
  }
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
