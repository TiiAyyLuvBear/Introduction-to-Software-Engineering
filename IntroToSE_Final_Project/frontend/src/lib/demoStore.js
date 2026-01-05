export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function seedJson(key, value) {
  const existing = localStorage.getItem(key)
  if (existing) return
  writeJson(key, value)
}

export function ensureDemoData() {
  seedJson('demo_wallets', [
    { id: 'w_cash', name: 'Cash on Hand', currency: 'USD', balance: 120 },
    { id: 'w_bank', name: 'Chase Checking', currency: 'USD', balance: 4200.5 },
    { id: 'w_savings', name: 'General Savings', currency: 'USD', balance: 8000 },
  ])

  seedJson('demo_categories', [
    { id: 'c_food', type: 'expense', name: 'Food & Dining', icon: 'restaurant' },
    { id: 'c_transport', type: 'expense', name: 'Transportation', icon: 'directions_bus' },
    { id: 'c_shopping', type: 'expense', name: 'Shopping', icon: 'shopping_bag' },
    { id: 'c_salary', type: 'income', name: 'Salary', icon: 'payments' },
  ])

  seedJson('demo_goals', [
    {
      id: 'g_emergency',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 7500,
      targetDate: '2026-12-01',
      icon: 'health_and_safety',
    },
    {
      id: 'g_trip',
      name: 'Japan Trip 2024',
      targetAmount: 2000,
      currentAmount: 400,
      targetDate: '2026-07-01',
      icon: 'flight',
    },
  ])

  seedJson('demo_budgets', [
    {
      id: 'b_food',
      name: 'Food & Dining',
      category: 'Food & Dining',
      limit: 800,
      spent: 450,
      resetInDays: 12,
      icon: 'restaurant',
      color: 'orange',
    },
    {
      id: 'b_transport',
      name: 'Transportation',
      category: 'Transportation',
      limit: 300,
      spent: 280,
      resetInDays: 5,
      icon: 'directions_car',
      color: 'yellow',
    },
  ])
}
