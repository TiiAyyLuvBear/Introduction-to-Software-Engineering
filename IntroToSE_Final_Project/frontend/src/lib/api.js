const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '')

const ACCESS_TOKEN_KEY = 'ml_access_token'
const REFRESH_TOKEN_KEY = 'ml_refresh_token'
const USER_KEY = 'ml_user'

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setSession({ user, accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const token = getAccessToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    const msg = data?.error || data?.message || data?.Message || res.statusText || 'Request failed'
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export const api = {
  // Auth
  async register({ name, email, password }) {
    return request('/auth/register', { method: 'POST', body: { name, email, password } })
  },
  async login({ email, password }) {
    return request('/auth/login', { method: 'POST', body: { email, password } })
  },
  async logout() {
    return request('/auth/logout', { method: 'POST' })
  },
  async profile() {
    return request('/auth/profile')
  },
  async me() {
    return request('/users/me')
  },

  // Wallets
  async listWallets({ status } = {}) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : ''
    return request(`/wallets${qs}`)
  },
  async createWallet({ name, type, initialBalance, currency, description }) {
    return request('/wallets', {
      method: 'POST',
      body: { name, type, initialBalance, currency, description },
    })
  },
  async updateWallet(id, { name, type, currency, description, status } = {}) {
    return request(`/wallets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { name, type, currency, description, status },
    })
  },
  async deleteWallet(id) {
    return request(`/wallets/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // Categories
  async listCategories({ page = 1, limit = 100 } = {}) {
    return request(`/categories?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`)
  },
  async createCategory({ name, type, color, icon } = {}) {
    return request('/categories', {
      method: 'POST',
      body: { name, type, color, icon },
    })
  },
  async updateCategory(id, { name, type, color, icon } = {}) {
    return request(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { name, type, color, icon },
    })
  },
  async deleteCategory(id) {
    return request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // Transactions
  async listTransactions(params = {}) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params || {})) {
      if (v === undefined || v === null || v === '') continue
      qs.set(k, String(v))
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request(`/transactions${suffix}`)
  },
  async createTransaction({ amount, type, walletId, categoryId, category, date, note }) {
    return request('/transactions', {
      method: 'POST',
      body: { amount, type, walletId, categoryId, category, date, note },
    })
  },
  async deleteTransaction(id) {
    return request(`/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async transfer({ fromWalletId, toWalletId, amount, date, note }) {
    return request('/transactions/transfer', {
      method: 'POST',
      body: { fromWalletId, toWalletId, amount, date, note },
    })
  },

  // Budgets
  async listBudgets() {
    return request('/budgets')
  },
  async createBudget({ walletId, name, categoryId, amount, period, startDate, endDate }) {
    return request('/budgets', {
      method: 'POST',
      body: { walletId, name, categoryId, amount, period, startDate, endDate },
    })
  },
  async deleteBudget(id) {
    return request(`/budgets/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // Goals
  async listGoals() {
    return request('/goals')
  },
  async getGoal(id) {
    return request(`/goals/${encodeURIComponent(id)}`)
  },
  async createGoal({ name, targetAmount, deadline, priority }) {
    return request('/goals', {
      method: 'POST',
      body: { name, targetAmount, deadline, priority },
    })
  },
  async contributeToGoal(goalId, { amount, walletId, date, note } = {}) {
    return request(`/goals/${encodeURIComponent(goalId)}/contribute`, {
      method: 'POST',
      body: { amount, walletId, date, note },
    })
  },

  // Reports
  async reportSummary({ startDate, endDate, walletId } = {}) {
    const qs = new URLSearchParams()
    if (startDate) qs.set('startDate', startDate)
    if (endDate) qs.set('endDate', endDate)
    if (walletId) qs.set('walletId', walletId)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request(`/reports/summary${suffix}`)
  },
  async reportByCategory({ startDate, endDate, walletId, type } = {}) {
    const qs = new URLSearchParams()
    if (startDate) qs.set('startDate', startDate)
    if (endDate) qs.set('endDate', endDate)
    if (walletId) qs.set('walletId', walletId)
    if (type) qs.set('type', type)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request(`/reports/by-category${suffix}`)
  },
  async reportByWallet({ startDate, endDate, type } = {}) {
    const qs = new URLSearchParams()
    if (startDate) qs.set('startDate', startDate)
    if (endDate) qs.set('endDate', endDate)
    if (type) qs.set('type', type)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request(`/reports/by-wallet${suffix}`)
  },

  async reportBarChart({ startDate, endDate, walletId, type, interval } = {}) {
    const qs = new URLSearchParams()
    if (startDate) qs.set('startDate', startDate)
    if (endDate) qs.set('endDate', endDate)
    if (walletId) qs.set('walletId', walletId)
    if (type) qs.set('type', type)
    if (interval) qs.set('interval', interval)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request(`/reports/bar-chart${suffix}`)
  },
}
