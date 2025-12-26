import accountsService from '../services/accountsService.js';

/**
 * Controller: Lấy danh sách accounts (có phân trang)
 * 
 * Endpoint: GET /api/accounts?page=1&limit=20
 * 
 * Use case:
 * - Hiển thị tất cả ví/tài khoản của user
 * - Tính tổng balance để hiển thị trên dashboard
 * - Dropdown chọn account khi tạo transaction
 */
export async function getAccounts(req, res) {
    try {
        const { page, limit } = req.query;
        const result = await accountsService.getAccounts({ page, limit });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
}

/**
 * Controller: Lấy chi tiết 1 account
 * 
 * Endpoint: GET /api/accounts/:id
 * 
 * Use case: Xem balance và thông tin account trước khi edit
 */
export async function getAccount(req, res) {
    try {
        const { id } = req.params;
        const account = await accountsService.getAccountById(id);
        res.json(account);
    } catch (err) {
        console.error(err);
        if (err.message === 'Invalid account ID') {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === 'Account not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
}

/**
 * Controller: Tạo account mới
 * 
 * Endpoint: POST /api/accounts
 * 
 * Body: { name, balance?, currency?, userId? }
 * 
 * Use case:
 * - Thêm ví tiền mặt (Cash)
 * - Thêm tài khoản ngân hàng (Vietcombank, ACB, ...)
 * - Thêm thẻ tín dụng (Credit Card)
 * - Thêm ví điện tử (Momo, ZaloPay)
 * 
 * Balance mặc định = 0 nếu không truyền
 */
export async function createAccount(req, res) {
    try {
        const accountData = req.body;
        const newAccount = await accountsService.createAccount(accountData);
        res.status(201).json(newAccount);
    } catch (err) {
        console.error(err);
        if (err.message === 'Account name is required') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
}

/**
 * Controller: Cập nhật account
 * 
 * Endpoint: PUT /api/accounts/:id
 * 
 * Body: { name?, balance?, currency? }
 * 
 * Use case:
 * - Đổi tên account
 * - Điều chỉnh balance (reconciliation - đối chiếu số dư)
 * - Đổi currency
 * 
 * Note: Balance thường được cập nhật tự động khi thêm/xóa transactions
 * Chỉ edit manual khi cần điều chỉnh (VD: sai số, quên ghi transaction cũ)
 */
export async function updateAccount(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedAccount = await accountsService.updateAccount(id, updates);
        res.json(updatedAccount);
    } catch (err) {
        console.error(err);
        if (err.message === 'Invalid account ID') {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === 'Account not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
}

/**
 * Controller: Xóa account
 * 
 * Endpoint: DELETE /api/accounts/:id
 * 
 * TODO: Cảnh báo nếu account có transactions
 * Có 2 approach:
 * 1. Chặn xóa nếu có transactions liên quan
 * 2. Xóa account và set account=null cho các transactions
 * 
 * Hiện tại: Cho phép xóa tự do (approach 2)
 */
export async function deleteAccount(req, res) {
    try {
        const { id } = req.params;
        const result = await accountsService.deleteAccount(id);
        res.json(result);
    } catch (err) {
        console.error(err);
        if (err.message === 'Invalid account ID') {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === 'Account not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
}
