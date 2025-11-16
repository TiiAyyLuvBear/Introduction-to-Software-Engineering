import React from 'react'

export default function TransactionList({items}){
  if(!items || items.length === 0) return <p>No transactions yet.</p>
  return (
    <ul className="tx-list">
      {items.map(tx => (
        <li key={tx._id} className="tx-item">
          <div className="tx-left">
            <strong>{tx.category || 'General'}</strong>
            <div className="tx-note">{tx.note}</div>
          </div>
          <div className="tx-right">
            <div className={`tx-amount ${tx.type === 'expense' ? 'neg' : 'pos'}`}>
              {tx.type === 'expense' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
            </div>
            <div className="tx-date">{new Date(tx.date).toLocaleDateString()}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}
