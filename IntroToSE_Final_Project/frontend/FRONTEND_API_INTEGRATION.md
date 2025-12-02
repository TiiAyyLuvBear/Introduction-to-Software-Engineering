# Frontend API Integration - Mockdata Removed

## ✅ Đã cập nhật

### 1. **api.js** - API Client với Firebase Auth
✅ **Thay đổi:**
- Thêm Firebase Auth interceptor tự động attach token vào mọi request
- Thêm response interceptor xử lý token expired (auto refresh)
- Thay đổi baseURL từ `localhost:4000` → `localhost:5000`
- Thêm đầy đủ API functions:
  - `authAPI` - verifyToken, getCurrentUser, updateProfile, deleteAccount
  - `transactionAPI` - getAll, create, update, delete, transfer
  - `categoryAPI` - getAll, create, update, delete
  - `budgetAPI` - getAll, create, getById, update, delete, getProgress
  - `savingGoalAPI` - getAll, create, getById, update, delete, addContribution
  - `reportAPI` - getSummary, getByCategory, getByWallet, getTrends

**Request Interceptor:**
```javascript
// Tự động lấy Firebase token và attach vào header
api.interceptors.request.use(async (config) => {
  const auth = getAuth()
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Response Interceptor:**
```javascript
// Auto refresh token khi hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired → refresh và retry
      const token = await user.getIdToken(true) // force refresh
      return api.request(originalRequest)
    }
  }
)
```

---

### 2. **Dashboard.jsx** 
✅ **Xóa mockdata:**
```javascript
// BEFORE
const mockTransactions = [
  { id: 1, category: 'Salary', type: 'income', amount: 5000, ... },
  ...
]
const [transactions] = useState(mockTransactions)
```

✅ **Sau khi cập nhật:**
```javascript
const [transactions, setTransactions] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  loadDashboardData()
}, [])

const loadDashboardData = async () => {
  const [transactionsRes, walletsRes] = await Promise.all([
    transactionAPI.getAll({ limit: 10 }),
    walletAPI.getUserWallets()
  ])
  setTransactions(transactionsRes.data.transactions || [])
  setWallets(walletsRes.data.wallets || [])
}
```

✅ **Features:**
- Loading state với spinner
- Error state với retry button
- Empty state message khi chưa có transactions
- Fetch real data từ API

---

### 3. **Wallets.jsx**
✅ **Xóa mockdata fallback:**
```javascript
// BEFORE (nếu API fail thì dùng mockdata)
catch (error) {
  setWallets([
    { id: 1, name: "Main Cash", ... },
    { id: 2, name: "Family Budget", ... }
  ])
}
```

✅ **Sau khi cập nhật:**
```javascript
catch (error) {
  console.error("Failed to load wallets:", error)
  setSubmitError(error.response?.data?.error || error.message)
  setWallets([]) // Empty array, không dùng mockdata
}
```

---

### 4. **Transactions.jsx**
✅ **Xóa localStorage và mockdata:**
```javascript
// BEFORE
const useBackend = false // Toggle flag
if (useBackend) {
  // API call
} else {
  // localStorage mockdata
  const saved = localStorage.getItem('transactions_demo')
  const demo = [...]
  localStorage.setItem('transactions_demo', ...)
}
```

✅ **Sau khi cập nhật:**
```javascript
// Luôn dùng API, không còn flag useBackend
useEffect(() => {
  loadTransactions()
}, [])

const loadTransactions = async () => {
  const res = await api.get('/transactions')
  setTransactions(res.data.data.transactions || [])
}

// Create transaction
const onSubmit = async (data) => {
  const res = await api.post('/transactions', data)
  loadTransactions() // Reload sau khi create
}

// Delete transaction
const handleDelete = async (id) => {
  await api.delete(`/transactions/${id}`)
  setTransactions(transactions.filter(t => t._id !== id))
}

// Transfer between wallets
const onSubmitTransfer = async (data) => {
  await api.post('/transactions/transfer', {
    fromWalletId: data.from,
    toWalletId: data.to,
    amount: data.amount
  })
  loadTransactions()
}
```

---

### 5. **Categories.jsx**
✅ **Xóa mockdata:**
```javascript
// BEFORE
const mockCategories = [
  { id: 1, name: 'Salary', type: 'income', ... },
  { id: 2, name: 'Freelance', ... },
  ...
]
const [categories, setCategories] = useState(mockCategories)
```

✅ **Sau khi cập nhật:**
```javascript
const [categories, setCategories] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadCategories()
}, [])

const loadCategories = async () => {
  const response = await categoryAPI.getAll()
  setCategories(response.data.categories || [])
}

const onSubmit = async (data) => {
  const response = await categoryAPI.create(data)
  setCategories([...categories, response.data.category])
}

const handleDelete = async (id) => {
  await categoryAPI.delete(id)
  setCategories(categories.filter(c => c._id !== id))
}
```

✅ **Features:**
- Loading state
- Error handling
- Real-time CRUD operations

---

### 6. **Budget.jsx**
✅ **Xóa localStorage:**
```javascript
// BEFORE
const saved = localStorage.getItem('budgets_demo')
const demo = [...]
localStorage.setItem('budgets_demo', ...)
```

✅ **Sau khi cập nhật:**
```javascript
useEffect(() => {
  loadBudgets()
  loadTransactions()
}, [])

const loadBudgets = async () => {
  const response = await budgetAPI.getAll()
  setBudgets(response.data.budgets || [])
}

const onCreateBudget = async (data) => {
  const response = await budgetAPI.create({
    name: data.name,
    amount: parseFloat(data.limit),
    categoryId: data.category,
    period: data.period,
    startDate: data.startDate,
    endDate: data.endDate
  })
  setBudgets([...budgets, response.data.budget])
}

const deleteBudget = async (id) => {
  await budgetAPI.delete(id)
  setBudgets(budgets.filter(b => b._id !== id))
}
```

---

### 7. **SavingGoals.jsx**
✅ **Xóa localStorage:**
```javascript
// BEFORE
const saved = localStorage.getItem('saving_goals_demo')
const demo = [...]
localStorage.setItem('saving_goals_demo', ...)
```

✅ **Sau khi cập nhật:**
```javascript
useEffect(() => {
  loadGoals()
}, [])

const loadGoals = async () => {
  const response = await savingGoalAPI.getAll()
  setGoals(response.data.goals || [])
}

const onCreateGoal = async (data) => {
  const response = await savingGoalAPI.create({
    name: data.name,
    targetAmount: parseFloat(data.targetAmount),
    currentAmount: parseFloat(data.currentAmount) || 0,
    deadline: data.deadline,
    description: data.description
  })
  setGoals([response.data.goal, ...goals])
}

const addContribution = async (id, amount) => {
  const response = await savingGoalAPI.addContribution(id, {
    amount: parseFloat(amount),
    note: 'Contribution'
  })
  setGoals(goals.map(g => g._id === id ? response.data.goal : g))
}

const deleteGoal = async (id) => {
  await savingGoalAPI.delete(id)
  setGoals(goals.filter(g => g._id !== id))
}
```

---

## 🔄 Luồng hoạt động mới

### Authentication Flow:
```
1. User đăng nhập qua Firebase Auth
   ↓
2. Firebase trả về ID Token
   ↓
3. Frontend lưu token (Firebase SDK tự động quản lý)
   ↓
4. Mỗi API request:
   - Interceptor tự động lấy token từ Firebase
   - Attach vào header: Authorization: Bearer <token>
   ↓
5. Backend verify token với Firebase Admin SDK
   ↓
6. Backend trả về dữ liệu từ MongoDB
```

### Data Flow:
```
Component Mount
    ↓
useEffect(() => loadData())
    ↓
API Request (với Firebase token auto-attached)
    ↓
Backend verify & query MongoDB
    ↓
Response → setState(data)
    ↓
Re-render với real data
```

### Error Handling:
```
API Error
    ↓
Check status code:
    - 401: Token expired → Auto refresh token → Retry request
    - 400: Validation error → Show error message
    - 404: Not found → Show not found message
    - 500: Server error → Show error message with retry button
```

---

## ⚠️ Breaking Changes

### 1. **Không còn localStorage**
- Dashboard, Transactions, Categories, Budget, SavingGoals không còn dùng localStorage
- Data persistence hoàn toàn qua MongoDB

### 2. **Không còn mock fallback**
- Nếu API fail → Show error message
- User phải có backend chạy để app hoạt động

### 3. **Cần Firebase Authentication**
- User phải đăng nhập qua Firebase
- Không có token = không gọi API được

---

## 📝 Testing Checklist

### Trước khi test frontend:

1. ✅ **Backend running:**
   ```bash
   cd backend
   npm run dev
   # Server chạy tại http://localhost:5000
   ```

2. ✅ **MongoDB running:**
   ```bash
   mongod --dbpath /path/to/data
   # Hoặc MongoDB Atlas connection
   ```

3. ✅ **Firebase setup:**
   - `.env` có Firebase credentials
   - Firebase project active
   - Authentication enabled

4. ✅ **Frontend config:**
   - `src/firebase.js` có đúng Firebase config
   - `src/api.js` baseURL = `http://localhost:5000/api`

### Test flow:

1. **Login:**
   - Đăng nhập qua Firebase (Email/Password hoặc Google)
   - Check Network tab: POST `/auth/verify`
   - Verify token được attach vào subsequent requests

2. **Dashboard:**
   - Check loading state
   - Check transactions và wallets load correctly
   - Check calculations (income, expense, balance)

3. **Wallets:**
   - Create wallet
   - Update wallet
   - Delete wallet
   - Check list updates

4. **Transactions:**
   - Create transaction
   - Search transactions
   - Transfer between wallets
   - Delete transaction

5. **Categories:**
   - Load categories
   - Create category
   - Delete category

6. **Budget:**
   - Create budget
   - Check spending calculation
   - Delete budget

7. **Saving Goals:**
   - Create goal
   - Add contribution
   - Check progress calculation
   - Delete goal

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" hoặc "Request failed"
**Solution:**
- Check backend đang chạy: `http://localhost:5000`
- Check CORS settings trong `backend/server.js`
- Check `api.js` baseURL đúng

### Issue 2: "401 Unauthorized"
**Solution:**
- Check user đã đăng nhập Firebase chưa
- Check token expiration
- Force refresh token: `auth.currentUser.getIdToken(true)`

### Issue 3: Empty data không có lỗi
**Solution:**
- Check response format: `response.data.data.items` hoặc `response.data.items`
- Check MongoDB có data không
- Check backend controllers trả về đúng format

### Issue 4: "Cannot read property of undefined"
**Solution:**
- Check optional chaining: `response.data?.items`
- Check default values: `items || []`
- Check loading state trước khi render

---

## ✅ Tổng kết

**Files đã cập nhật:**
- ✅ `frontend/src/api.js` - API client với Firebase interceptor
- ✅ `frontend/src/pages/Dashboard.jsx` - Remove mockdata
- ✅ `frontend/src/pages/Wallets.jsx` - Remove mockdata fallback
- ✅ `frontend/src/pages/Transactions.jsx` - Remove localStorage
- ✅ `frontend/src/pages/Categories.jsx` - Remove mockdata
- ✅ `frontend/src/pages/Budget.jsx` - Remove localStorage
- ✅ `frontend/src/pages/SavingGoals.jsx` - Remove localStorage

**Chức năng:**
- ✅ Firebase Auth token tự động attach vào mọi request
- ✅ Token auto refresh khi expired
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Real-time CRUD operations
- ✅ Không còn mockdata/localStorage

**Next steps:**
1. Start backend server
2. Start frontend dev server
3. Test authentication flow
4. Test CRUD operations cho từng module
5. Fix bugs nếu có

🎉 **Frontend đã sẵn sàng integrate với backend!**
