import React from 'react'

export default function TransactionList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions yet.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map(tx => (
        <li
          key={tx._id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <strong className="text-gray-800 font-semibold">
                {tx.category || 'General'}
              </strong>
              <div className="text-sm text-gray-500 mt-1">{tx.note}</div>
            </div>
            <div className="text-right ml-4">
              <div
                className={`text-lg font-bold ${
                  tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {tx.type === 'expense' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(tx.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
