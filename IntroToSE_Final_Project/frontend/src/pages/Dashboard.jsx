import React, {useState} from 'react'

const mockTransactions = [
  { id: 1, category: 'Salary', type: 'income', amount: 5000, date: '2025-11-01', note: 'Monthly salary' },
  { id: 2, category: 'Groceries', type: 'expense', amount: 150, date: '2025-11-05', note: 'Weekly shopping' },
  { id: 3, category: 'Restaurant', type: 'expense', amount: 45, date: '2025-11-07', note: 'Dinner with friends' },
  { id: 4, category: 'Freelance', type: 'income', amount: 800, date: '2025-11-08', note: 'Web design project' },
  { id: 5, category: 'Transportation', type: 'expense', amount: 60, date: '2025-11-09', note: 'Gas and parking' },
]

export default function Dashboard() {
  const [transactions] = useState(mockTransactions)

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your finances</p>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Total Income</span>
            <span className="card-icon">📈</span>
          </div>
          <div className="card-amount income">${totalIncome.toFixed(2)}</div>
          <div className="card-change">This month</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Total Expense</span>
            <span className="card-icon">📉</span>
          </div>
          <div className="card-amount expense">${totalExpense.toFixed(2)}</div>
          <div className="card-change">This month</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Balance</span>
            <span className="card-icon">💵</span>
          </div>
          <div className="card-amount balance">${balance.toFixed(2)}</div>
          <div className="card-change">Current balance</div>
        </div>
      </div>

      <div className="transaction-list">
        <div className="list-header">
          <h3>Recent Transactions</h3>
        </div>
        {transactions.slice(0, 5).map(tx => (
          <div key={tx.id} className="transaction-item">
            <div className="transaction-left">
              <div className={`transaction-icon-circle ${tx.type}`}>
                {tx.type === 'income' ? '💰' : '💸'}
              </div>
              <div className="transaction-info">
                <div className="transaction-category">{tx.category}</div>
                <div className="transaction-note">{tx.note}</div>
              </div>
            </div>
            <div className="transaction-right">
              <div className={`transaction-amount ${tx.type}`}>
                {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
              </div>
              <div className="transaction-date">
                {new Date(tx.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
