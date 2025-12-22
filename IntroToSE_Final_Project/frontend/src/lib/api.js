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

let inFlightRefresh = null
async function refreshAccessToken() {
  const rt = getRefreshToken()
  if (!rt) throw new Error('Session expired')

  if (!inFlightRefresh) {
    inFlightRefresh = (async () => {
      let res
      try {
        res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        })
      } catch (e) {
        throw makeNetworkError(e)
      }

      const text = await res.text()
      const data = text ? safeJson(text) : null

      if (!res.ok) {
        clearSession()
        const msg = data?.error || data?.message || res.statusText || 'Session expired'
        throw new Error(msg)
      }

      const next = data?.data || data
      const newAccessToken = next?.accessToken
      if (!newAccessToken) {
        clearSession()
        throw new Error('Session expired')
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
      return newAccessToken
    })().finally(() => {
      inFlightRefresh = null
    })
  }

  return inFlightRefresh
}

function makeNetworkError(original) {
  const err = new Error(`Cannot reach API server at ${API_BASE_URL}. Is the backend running?`)
  err.cause = original
  err.isNetworkError = true
  return err
}

async function request(path, { method = 'GET', body, headers, _retry } = {}) {
  const token = getAccessToken()
  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (e) {
    throw makeNetworkError(e)
  }

  if (res.status === 401 && !_retry && getRefreshToken()) {
    try {
      await refreshAccessToken()
      return request(path, { method, body, headers, _retry: true })
    } catch {
      // fallthrough to normal error
    }
  }

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    let msg = data?.error || data?.message || data?.Message || res.statusText || 'Request failed'
    if (res.status === 403 && (msg === 'Forbidden' || msg === 'Request failed')) msg = 'Insufficient permission'
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

async function requestFormData(path, { method = 'POST', formData, headers, _retry } = {}) {
  const token = getAccessToken()
  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: formData,
    })
  } catch (e) {
    throw makeNetworkError(e)
  }

  if (res.status === 401 && !_retry && getRefreshToken()) {
    try {
      await refreshAccessToken()
      return requestFormData(path, { method, formData, headers, _retry: true })
    } catch {
      // fallthrough
    }
  }

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    let msg = data?.error || data?.message || data?.Message || res.statusText || 'Request failed'
    if (res.status === 403 && (msg === 'Forbidden' || msg === 'Request failed')) msg = 'Insufficient permission'
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
  async forgotPassword({ email }) {
    return request('/auth/forgot-password', { method: 'POST', body: { email } })
  },
  async resetPassword({ email, token, password }) {
    return request('/auth/reset-password', { method: 'POST', body: { email, token, password } })
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
  async updateMe({ name, email, phone } = {}) {
    return request('/users/me', { method: 'PUT', body: { name, email, phone } })
  },
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return requestFormData('/users/avatar', { method: 'PUT', formData })
  },

  // Wallets
  async listWallets({ status } = {}) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : ''
    return request(`/wallets${qs}`)
  },
  async createWallet({ name, type, initialBalance, currency, description, isShared }) {
    return request('/wallets', {
      method: 'POST',
      body: { name, type, initialBalance, currency, description, isShared },
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

  // Shared Wallets (U011–U015)
  async inviteWalletMember(walletId, { email, message } = {}) {
    return request(`/wallets/${encodeURIComponent(walletId)}/invite`, {
      method: 'POST',
      body: { email, message },
    })
  },
  async getWalletMembers(walletId) {
    return request(`/wallets/${encodeURIComponent(walletId)}/members`)
  },
  async leaveWallet(walletId) {
    return request(`/wallets/${encodeURIComponent(walletId)}/leave`, { method: 'POST' })
  },
  async transferWalletOwnership(walletId, { newOwnerId } = {}) {
    return request(`/wallets/${encodeURIComponent(walletId)}/transfer-ownership`, {
      method: 'POST',
      body: { newOwnerId },
    })
  },
  async removeWalletMember(walletId, memberId) {
    return request(`/wallets/${encodeURIComponent(walletId)}/members/${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
    })
  },
  async setWalletMemberPermission(walletId, memberId, { permission } = {}) {
    return request(`/wallets/${encodeURIComponent(walletId)}/members/${encodeURIComponent(memberId)}/permission`, {
      method: 'PUT',
      body: { permission },
    })
  },

  // Invitations
  async listPendingInvitations() {
    return request('/invitations/pending')
  },
  async respondToInvitation(invitationId, { response } = {}) {
    return request(`/invitations/${encodeURIComponent(invitationId)}/respond`, {
      method: 'POST',
      body: { response },
    })
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
  async updateTransaction(id, { amount, type, walletId, categoryId, category, date, note } = {}) {
    return request(`/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { amount, type, walletId, categoryId, category, date, note },
    })
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
  async createGoal({ name, targetAmount, deadline, priority, walletId, description, image }) {
    return request('/goals', {
      method: 'POST',
      body: { name, targetAmount, deadline, priority, walletId, description, image },
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
