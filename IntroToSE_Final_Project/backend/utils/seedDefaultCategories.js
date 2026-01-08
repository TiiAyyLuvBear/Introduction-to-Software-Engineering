import Category from '../models/Category.js'

export const DEFAULT_CATEGORIES = [
  // Income
  { name: 'Salary', type: 'income', icon: 'salary', color: '#22c55e' },
  { name: 'Bonus', type: 'income', icon: 'bonus', color: '#16a34a' },
  { name: 'Freelance', type: 'income', icon: 'freelance', color: '#10b981' },
  { name: 'Investment', type: 'income', icon: 'investment', color: '#34d399' },
  { name: 'Gift', type: 'income', icon: 'gift', color: '#4ade80' },
  { name: 'Refund', type: 'income', icon: 'refund', color: '#86efac' },
  { name: 'Other Income', type: 'income', icon: 'income', color: '#22c55e' },

  // Expense
  { name: 'Food & Drinks', type: 'expense', icon: 'food', color: '#f97316' },
  { name: 'Groceries', type: 'expense', icon: 'groceries', color: '#fb923c' },
  { name: 'Transport', type: 'expense', icon: 'transport', color: '#0ea5e9' },
  { name: 'Shopping', type: 'expense', icon: 'shopping', color: '#a855f7' },
  { name: 'Bills', type: 'expense', icon: 'bills', color: '#ef4444' },
  { name: 'Rent', type: 'expense', icon: 'rent', color: '#f43f5e' },
  { name: 'Health', type: 'expense', icon: 'health', color: '#14b8a6' },
  { name: 'Education', type: 'expense', icon: 'education', color: '#6366f1' },
  { name: 'Entertainment', type: 'expense', icon: 'entertainment', color: '#eab308' },
  { name: 'Travel', type: 'expense', icon: 'travel', color: '#06b6d4' },
  { name: 'Subscriptions', type: 'expense', icon: 'subscriptions', color: '#64748b' },
  { name: 'Family', type: 'expense', icon: 'family', color: '#f472b6' },
  { name: 'Other Expense', type: 'expense', icon: 'expense', color: '#f97316' },
]

export async function seedDefaultCategories() {
  const ops = DEFAULT_CATEGORIES.map((c) => ({
    updateOne: {
      filter: { name: c.name, type: c.type, isDefault: true },
      update: {
        $set: {
          ...c,
          isDefault: true,
          userId: undefined,
        },
      },
      upsert: true,
    },
  }))

  return Category.bulkWrite(ops)
}
