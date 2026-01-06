# 📦 Frontend Services Layer

Thư mục này chứa tất cả các service để gọi API backend với JWT authentication tự động.

## 📁 Cấu Trúc

```
services/
├── api.js                  # Base HTTP client với JWT token handling
├── authService.js          # Authentication APIs (login, register, logout)
├── walletService.js        # Wallet management APIs
├── transactionService.js   # Transaction APIs
├── categoryService.js      # Category APIs
├── budgetService.js        # Budget APIs
├── goalService.js          # Saving goal APIs
├── reportService.js        # Report & analytics APIs
├── index.js                # Export tất cả services
└── README.md               # File này
```

---

## 🚀 Cách Sử Dụng

### **1. Import Services**

#### **Option 1: Import từ index (Recommended)**
```javascript
import { authService, walletService } from '@/services'

// Hoặc
import services from '@/services'
```

#### **Option 2: Import trực tiếp**
```javascript
import authService from '@/services/authService'
import walletService from '@/services/walletService'
```

---

### **2. Authentication Service**

#### **Đăng ký tài khoản mới**
```javascript
import { authService } from '@/services'

try {
  const result = await authService.register({
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456'
  })
  
  console.log('User registered:', result.data.user)
  console.log('Access token:', result.data.accessToken)
  // Token tự động được lưu vào localStorage
} catch (error) {
  console.error('Registration failed:', error.message)
}
```

#### **Đăng nhập**
```javascript
import { authService } from '@/services'

try {
  const result = await authService.login({
    email: 'john@example.com',
    password: '123456'
  })
  
  console.log('Login successful:', result.data.user)
  // Token tự động được lưu vào localStorage
} catch (error) {
  console.error('Login failed:', error.message)
}
```

#### **Đăng xuất**
```javascript
import { authService } from '@/services'

await authService.logout()
// Session tự động được xóa khỏi localStorage
```

#### **Lấy thông tin user hiện tại**
```javascript
import { authService } from '@/services'

try {
  const result = await authService.getProfile()
  console.log('Current user:', result.data.user)
} catch (error) {
  console.error('Not authenticated:', error.message)
}
```

---

### **3. Wallet Service**

#### **Lấy danh sách ví**
```javascript
import { walletService } from '@/services'

const result = await walletService.listWallets()
console.log('Wallets:', result.data.wallets)

// Lọc theo status
const activeWallets = await walletService.listWallets({ status: 'active' })
```

#### **Tạo ví mới**
```javascript
import { walletService } from '@/services'

const result = await walletService.createWallet({
  name: 'My Wallet',
  type: 'personal',
  initialBalance: 1000000,
  currency: 'VND',
  description: 'Personal spending wallet'
})

console.log('Created wallet:', result.data.wallet)
```

#### **Cập nhật ví**
```javascript
import { walletService } from '@/services'

await walletService.updateWallet('wallet-id', {
  name: 'Updated Wallet Name',
  status: 'active'
})
```

#### **Xóa ví**
```javascript
import { walletService } from '@/services'

await walletService.deleteWallet('wallet-id')
```

---

### **4. Transaction Service**

#### **Lấy danh sách giao dịch**
```javascript
import { transactionService } from '@/services'

const result = await transactionService.listTransactions({
  walletId: 'wallet-id',
  type: 'expense',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  page: 1,
  limit: 20
})

console.log('Transactions:', result.data.transactions)
```

#### **Tạo giao dịch mới**
```javascript
import { transactionService } from '@/services'

const result = await transactionService.createTransaction({
  amount: 50000,
  type: 'expense',
  walletId: 'wallet-id',
  categoryId: 'category-id',
  date: new Date().toISOString(),
  note: 'Lunch'
})
```

#### **Chuyển tiền giữa các ví**
```javascript
import { transactionService } from '@/services'

await transactionService.transfer({
  fromWalletId: 'wallet-1',
  toWalletId: 'wallet-2',
  amount: 100000,
  date: new Date().toISOString(),
  note: 'Transfer to savings'
})
```

---

### **5. Category Service**

```javascript
import { categoryService } from '@/services'

// Lấy danh sách categories
const categories = await categoryService.listCategories()

// Tạo category mới
await categoryService.createCategory({
  name: 'Food',
  type: 'expense',
  color: '#FF5722',
  icon: 'restaurant'
})

// Cập nhật category
await categoryService.updateCategory('category-id', {
  name: 'Food & Drinks',
  color: '#FF6B6B'
})

// Xóa category
await categoryService.deleteCategory('category-id')
```

---

### **6. Budget Service**

```javascript
import { budgetService } from '@/services'

// Lấy danh sách budgets
const budgets = await budgetService.listBudgets()

// Tạo budget mới
await budgetService.createBudget({
  walletId: 'wallet-id',
  name: 'Monthly Food Budget',
  categoryId: 'category-id',
  amount: 3000000,
  period: 'monthly',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
})

// Xóa budget
await budgetService.deleteBudget('budget-id')
```

---

### **7. Goal Service**

```javascript
import { goalService } from '@/services'

// Lấy danh sách goals
const goals = await goalService.listGoals()

// Tạo goal mới
await goalService.createGoal({
  name: 'Buy a car',
  targetAmount: 500000000,
  deadline: '2026-12-31',
  priority: 'high'
})

// Đóng góp vào goal
await goalService.contributeToGoal('goal-id', {
  amount: 5000000,
  walletId: 'wallet-id',
  date: new Date().toISOString(),
  note: 'Monthly contribution'
})
```

---

### **8. Report Service**

```javascript
import { reportService } from '@/services'

// Lấy summary report
const summary = await reportService.getSummary({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  walletId: 'wallet-id'
})

// Lấy report theo category
const categoryReport = await reportService.getByCategory({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  type: 'expense'
})

// Lấy bar chart data
const chartData = await reportService.getBarChart({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  interval: 'month'
})
```

---

## 🔐 JWT Token Handling

### **Tự động thêm Authorization header**

Tất cả các request đều **tự động** thêm JWT token vào header:

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Tự động lưu token sau login/register**

```javascript
// Sau khi login thành công
await authService.login({ email, password })

// Token tự động được lưu vào localStorage:
// - ml_access_token
// - ml_refresh_token
// - ml_user
```

### **Tự động xóa token sau logout**

```javascript
await authService.logout()
// Tất cả token và user data bị xóa khỏi localStorage
```

### **Kiểm tra token thủ công**

```javascript
import { getAccessToken, getStoredUser } from '@/services'

const token = getAccessToken()
const user = getStoredUser()

if (!token) {
  console.log('User not logged in')
}
```

---

## ⚙️ Configuration

### **Thay đổi API Base URL**

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Hoặc cho production:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 🛠️ Error Handling

### **Xử lý lỗi chuẩn**

```javascript
import { authService } from '@/services'

try {
  const result = await authService.login({ email, password })
  console.log('Success:', result)
} catch (error) {
  // error.message: Error message từ server
  // error.status: HTTP status code (401, 404, 500, etc.)
  // error.data: Full response data từ server
  
  if (error.status === 401) {
    console.error('Invalid credentials')
  } else if (error.status === 500) {
    console.error('Server error')
  } else {
    console.error('Error:', error.message)
  }
}
```

### **Các lỗi phổ biến**

| Status | Ý nghĩa | Xử lý |
|--------|---------|-------|
| 400 | Bad Request - Thiếu dữ liệu | Kiểm tra input |
| 401 | Unauthorized - Token invalid/expired | Redirect to login |
| 403 | Forbidden - Không có quyền | Show error message |
| 404 | Not Found - Resource không tồn tại | Show not found page |
| 409 | Conflict - Duplicate (email đã tồn tại) | Show error message |
| 500 | Server Error | Show error, retry |

---

## 📚 Best Practices

### **1. Luôn dùng try-catch**
```javascript
try {
  const result = await authService.login({ email, password })
  // Handle success
} catch (error) {
  // Handle error
  console.error(error.message)
}
```

### **2. Kiểm tra authentication trước khi gọi protected APIs**
```javascript
import { getAccessToken } from '@/services'

if (!getAccessToken()) {
  // Redirect to login
  window.location.href = '/login'
  return
}

// Safe to call protected APIs
const wallets = await walletService.listWallets()
```

### **3. Sử dụng async/await thay vì .then()**
```javascript
// ✅ GOOD
const result = await authService.login({ email, password })

// ❌ BAD
authService.login({ email, password }).then(result => { ... })
```

### **4. Destructure response data**
```javascript
const { data } = await authService.login({ email, password })
const { user, accessToken } = data
```

---

## 🔄 Migration từ `lib/api.js`

### **Trước (Old)**
```javascript
import { api } from '@/lib/api'

const result = await api.login({ email, password })
```

### **Sau (New)**
```javascript
import { authService } from '@/services'

const result = await authService.login({ email, password })
```

### **Lợi ích:**
- ✅ Tổ chức code tốt hơn (mỗi service một file)
- ✅ Dễ maintain và scale
- ✅ JSDoc documentation đầy đủ
- ✅ Tự động quản lý JWT token
- ✅ Type hints tốt hơn trong IDE

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend server đang chạy (`http://localhost:4000`)
2. MongoDB đã kết nối
3. JWT_SECRET đã được set trong `.env`
4. Token chưa hết hạn

---

**Happy coding! 🚀**
