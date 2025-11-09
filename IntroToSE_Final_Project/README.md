# 💸 Money Lover Clone - Personal Finance Manager

Ứng dụng web quản lý tài chính cá nhân tương tự Money Lover, được xây dựng với React và Express + MongoDB.

## 📋 Tính năng

- ✅ **Dashboard**: Tổng quan thu nhập, chi tiêu và số dư
- ✅ **Quản lý giao dịch**: Thêm, xem, xóa các giao dịch thu/chi
- ✅ **Quản lý danh mục**: Tạo và quản lý các danh mục thu nhập/chi tiêu
- ✅ **Quản lý tài khoản**: Quản lý nhiều tài khoản/ví khác nhau
- 🎨 **Giao diện đẹp**: UI hiện đại, responsive với nhiều màu sắc

## 🏗️ Cấu trúc dự án

```
IntroToSE_Final_Project/
├── frontend/          # React + Vite (giao diện người dùng)
│   ├── src/
│   │   ├── components/   # Sidebar, components tái sử dụng
│   │   ├── pages/        # Dashboard, Transactions, Categories, Accounts
│   │   ├── App.jsx       # Component chính
│   │   └── styles.css    # CSS styling
│   └── package.json
│
├── backend/           # Express + MongoDB (API server)
│   ├── models/           # User, Transaction, Category, Account models
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống

- Node.js (phiên bản 16 trở lên)
- MongoDB (local hoặc MongoDB Atlas)
- Git

### Bước 1: Clone repository

```cmd
git clone <repository-url>
cd IntroToSE_Final_Project
```

### Bước 2: Cài đặt và chạy Frontend

Mở terminal thứ nhất (cmd hoặc PowerShell):

```cmd
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Bước 3: Cài đặt và chạy Backend (Tùy chọn)

**Lưu ý**: Hiện tại frontend đang chạy với dữ liệu mẫu (mock data), bạn có thể demo mà không cần backend.

Nếu muốn kết nối backend với MongoDB, mở terminal thứ hai:

```cmd
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```
MONGODB_URI=mongodb://localhost:27017/moneylover
PORT=4000
```

Chạy backend:

```cmd
npm run dev
```

Backend sẽ chạy tại: **http://localhost:4000**

## 🎯 Cách sử dụng (Demo)

### Dashboard
- Xem tổng quan thu nhập, chi tiêu, số dư
- Xem danh sách giao dịch gần đây

### Transactions (Giao dịch)
1. Click "Add Transaction" để thêm giao dịch mới
2. Chọn loại: Thu nhập hoặc Chi tiêu
3. Nhập thông tin: Danh mục, số tiền, ngày, tài khoản, ghi chú
4. Click "Save Transaction"
5. Xóa giao dịch bằng nút "Delete"

### Categories (Danh mục)
1. Xem danh sách danh mục thu nhập và chi tiêu
2. Click "Add Category" để tạo danh mục mới
3. Chọn tên, icon (emoji), màu sắc
4. Xóa danh mục không cần thiết

### Accounts (Tài khoản)
1. Xem tổng số dư trên tất cả tài khoản
2. Click "Add Account" để thêm tài khoản mới
3. Nhập tên, số dư ban đầu, loại tiền tệ
4. Quản lý nhiều ví/tài khoản khác nhau

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool và dev server
- **Axios** - HTTP client (sẵn sàng cho API integration)
- **CSS3** - Styling (không dùng framework để dễ customize)

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM cho MongoDB
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Auto-restart dev server

## 📝 API Endpoints (Backend)

Khi backend chạy, các endpoint sau sẽ có sẵn:

### Transactions
- `GET /api/transactions` - Lấy danh sách giao dịch
- `POST /api/transactions` - Tạo giao dịch mới
- `DELETE /api/transactions/:id` - Xóa giao dịch

### Categories
- `GET /api/categories` - Lấy danh sách danh mục (có pagination)
- `GET /api/categories/:id` - Lấy chi tiết danh mục
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Accounts
- `GET /api/accounts` - Lấy danh sách tài khoản
- `POST /api/accounts` - Tạo tài khoản mới
- `PUT /api/accounts/:id` - Cập nhật tài khoản
- `DELETE /api/accounts/:id` - Xóa tài khoản

### Users
- `GET /api/users` - Lấy danh sách người dùng
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/:id` - Cập nhật thông tin
- `DELETE /api/users/:id` - Xóa người dùng

## 🎨 Screenshots

Ứng dụng bao gồm 4 trang chính:
1. **Dashboard** - Tổng quan tài chính
2. **Transactions** - Quản lý giao dịch
3. **Categories** - Quản lý danh mục
4. **Accounts** - Quản lý tài khoản

## 🔜 Tính năng sắp tới

- [ ] Xác thực người dùng (JWT authentication)
- [ ] Phân quyền dữ liệu theo user
- [ ] Biểu đồ thống kê chi tiêu
- [ ] Báo cáo theo tháng/năm
- [ ] Export dữ liệu ra Excel/PDF
- [ ] Tìm kiếm và lọc giao dịch nâng cao
- [ ] Đa ngôn ngữ (Vietnamese/English)
- [ ] Dark mode

## 📞 Liên hệ

Dự án được phát triển bởi nhóm sinh viên HCMUS cho môn Introduction to Software Engineering.

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập.
