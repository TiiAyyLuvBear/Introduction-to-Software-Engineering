import mongoose from 'mongoose'

/**
 * Category Schema - Định nghĩa danh mục phân loại giao dịch
 * 
 * Danh mục giúp người dùng phân loại thu/chi theo mục đích:
 * Ví dụ thu nhập: Lương, Freelance, Đầu tư
 * Ví dụ chi tiêu: Ăn uống, Đi lại, Mua sắm, Học phí
 * 
 * Mỗi user có thể tạo danh mục riêng hoặc dùng danh mục chung
 */
const CategorySchema = new mongoose.Schema({
  // Tên danh mục (VD: "Groceries", "Salary", "Transportation")
  name: { type: String, required: true },

  // Icon identifier for UI (M4-01)
  icon: { type: String },
  
  // Loại danh mục: 'income' (thu nhập) hoặc 'expense' (chi tiêu)
  // enum giới hạn chỉ nhận 2 giá trị này
  type: { type: String, enum: ['income','expense'], required: true },
  
  // Màu sắc để hiển thị trên UI (VD: "#3498db", "#e74c3c")
  color: { type: String },

  // Default categories seeded by system (M4-01)
  isDefault: { type: Boolean, default: false },
  
  // ID của user sở hữu danh mục này
  // ref: 'User' cho phép populate() để lấy thông tin user
  // required: false nghĩa là có thể có danh mục chung (không thuộc user nào)
  userId: { type: String, ref: 'User', required: false }
}, { timestamps: true })

CategorySchema.index({ userId: 1, type: 1 })
CategorySchema.index({ isDefault: 1, type: 1 })

/**
 * Export model Category
 * Sử dụng trong controllers để:
 * - Lấy danh sách categories của user
 * - Tạo category mới
 * - Cập nhật/xóa category
 * - Filter transactions theo category
 */
export default mongoose.model('Category', CategorySchema)
