import mongoose from 'mongoose';
import z from 'zod';

export const RegisterValidation = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6), // Password này để hash vào DB
  token: z.string() // ID Token từ Firebase
});

const UserSchema = new mongoose.Schema({
  // Mongoose mặc định dùng _id là ObjectId, 
  // nhưng của bạn có vẻ là chuỗi (String) từ Firebase/Auth service khác
  _id: { type: String, required: true },

  fullName: { type: String, default: "" },
  name: { type: String, required: true },
  phoneNumber: { type: String, default: null },
  avatarURL: { type: String, default: null },
  email: { type: String, required: true, unique: true },

  // Khớp chính xác tên biến có chữ W viết hoa
  passWordHash: { type: String, default: null },

  // Firebase UID (optional)
  firebaseUid: { type: String, default: null },

  roles: { type: [String], default: ["user"] }
}, {
  // timestamps: true sẽ tự động quản lý createdAt/updatedAt 
  // khớp với cấu trúc $date bạn đang có
  timestamps: true,

  // Quan trọng: Nếu bảng có sẵn tên là 'users' thì ghi 'users'
  collection: 'users',

  // QUAN TRỌNG: Cho phép custom _id (không tự động generate ObjectId)
  _id: false
});

/**
 * Export model User
 * Model này cung cấp các methods để tương tác với collection 'users' trong MongoDB:
 * - User.find() - Tìm nhiều users
 * - User.findById() - Tìm user theo ID
 * - User.create() - Tạo user mới
 * - User.findByIdAndUpdate() - Cập nhật user
 * - User.findByIdAndDelete() - Xóa user
 */
export default mongoose.model('User', UserSchema);
