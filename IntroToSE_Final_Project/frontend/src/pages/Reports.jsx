import React, { useState, useEffect } from 'react'
import { BarChart3, Wallet, FileText, Download, Share2, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react'

export default function Reports() {
  const [reportType, setReportType] = useState('category') // 'category' or 'wallet'
  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [timeRange, setTimeRange] = useState('month') // 'month', 'quarter', 'year', 'custom'
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedWallet, setSelectedWallet] = useState('all')

  useEffect(() => {
    // Load transactions
    const savedTx = localStorage.getItem('transactions_demo')
    if (savedTx) {
      try { setTransactions(JSON.parse(savedTx)) } catch (e) { setTransactions([]) }
    }

    // Load wallets
    const savedWallets = localStorage.getItem('wallets_demo')
    if (savedWallets) {
      try { setWallets(JSON.parse(savedWallets)) } catch (e) { setWallets([]) }
    }
  }, [])

  const filterTransactionsByDate = (txs) => {
    return txs.filter(tx => {
      const txDate = new Date(tx.date)
      return txDate >= new Date(startDate) && txDate <= new Date(endDate)
    })
  }

  const filterTransactionsByWallet = (txs) => {
    if (selectedWallet === 'all') return txs
    return txs.filter(tx => tx.account === selectedWallet)
  }

  const getFilteredTransactions = () => {
    let filtered = filterTransactionsByDate(transactions)
    filtered = filterTransactionsByWallet(filtered)
    return filtered
  }

  // Category Report
  const generateCategoryReport = () => {
    const filtered = getFilteredTransactions()
    const byCategory = {}

    filtered.forEach(tx => {
      if (!byCategory[tx.category]) {
        byCategory[tx.category] = { income: 0, expense: 0 }
      }
      if (tx.type === 'income') {
        byCategory[tx.category].income += tx.amount
      } else {
        byCategory[tx.category].expense += tx.amount
      }
    })

    return byCategory
  }

  // Wallet Report
  const generateWalletReport = () => {
    const filtered = getFilteredTransactions()
    const byWallet = {}

    wallets.forEach(wallet => {
      byWallet[wallet.name] = { income: 0, expense: 0, balance: wallet.balance }
    })

    filtered.forEach(tx => {
      if (byWallet[tx.account]) {
        if (tx.type === 'income') {
          byWallet[tx.account].income += tx.amount
        } else {
          byWallet[tx.account].expense += tx.amount
        }
      }
    })

    return byWallet
  }

  const categoryReport = generateCategoryReport()
  const walletReport = generateWalletReport()

  const totalIncome = getFilteredTransactions()
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const totalExpense = getFilteredTransactions()
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const netBalance = totalIncome - totalExpense

  // Derived values for charts and exports
  const totalByCategory = Object.entries(categoryReport).map(([category, data]) => {
    const net = (data.income || 0) - (data.expense || 0)
    const total = (data.income || 0) + (data.expense || 0)
    const pct = totalIncome + totalExpense === 0 ? 0 : (total / (totalIncome + totalExpense)) * 100
    return { category, income: data.income || 0, expense: data.expense || 0, net, total, pct }
  }).sort((a,b) => b.total - a.total)

  const totalByWallet = Object.entries(walletReport).map(([wallet, data]) => {
    const net = (data.income || 0) - (data.expense || 0)
    const total = (data.income || 0) + (data.expense || 0)
    const pct = (totalIncome + totalExpense) === 0 ? 0 : (total / (totalIncome + totalExpense)) * 100
    return { wallet, income: data.income || 0, expense: data.expense || 0, net, total, pct }
  }).sort((a,b) => b.total - a.total)

  const [openCategory, setOpenCategory] = React.useState(null)
  const [openWallet, setOpenWallet] = React.useState(null)

  const exportCSV = (rows, filename = 'report.csv') => {
    const lines = rows.map(r => r.join(','))
    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportJSON = (data, filename = 'report.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const tryShare = async (title, text) => {
    if (navigator.share) {
      try { await navigator.share({ title, text }) } catch (e) { console.warn('Share failed', e) }
    } else {
      // fallback: copy to clipboard
      try { await navigator.clipboard.writeText(text); alert('Report copied to clipboard') } catch (e) { alert('Share not supported') }
    }
  }

  return (
    <div>
      <div className="page-header mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Financial Reports</h2>
        <p className="text-gray-600">Analyze your spending and income patterns</p>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            reportType === 'category' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setReportType('category')}
        >
          <BarChart3 className="w-5 h-5 inline mr-2" /> By Category
        </button>
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            reportType === 'wallet' 
              ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setReportType('wallet')}
        >
          <Wallet className="w-5 h-5 inline mr-2" /> By Wallet
        </button>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 mb-6 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label>Time Range</label>
            <select
              className="form-control"
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value)
                const now = new Date()
                if (e.target.value === 'month') {
                  setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
                  setEndDate(now.toISOString().split('T')[0])
                } else if (e.target.value === 'quarter') {
                  const quarter = Math.floor(now.getMonth() / 3)
                  setStartDate(new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0])
                  setEndDate(now.toISOString().split('T')[0])
                } else if (e.target.value === 'year') {
                  setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0])
                  setEndDate(now.toISOString().split('T')[0])
                }
              }}
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {timeRange === 'custom' && (
            <>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label>End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {reportType === 'wallet' && (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label>Wallet</label>
              <select
                className="form-control"
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <option value="all">All Wallets</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 border-green-200 hover:border-green-400 hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-600 font-semibold">Total Income</span>
            <TrendingUp className="w-8 h-8 text-green-600 animate-bounce" />
          </div>
          <div className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 border-red-200 hover:border-red-400 hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-600 font-semibold">Total Expense</span>
            <TrendingDown className="w-8 h-8 text-red-600 animate-bounce" />
          </div>
          <div className="text-3xl font-bold text-red-600">${totalExpense.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 border-blue-200 hover:border-blue-400 hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-600 font-semibold">Net Balance</span>
            <DollarSign className="w-8 h-8 text-blue-600 animate-bounce" />
          </div>
          <div className="text-3xl font-bold text-blue-600">${netBalance.toFixed(2)}</div>
        </div>
      </div>

      {reportType === 'category' && (
        <div className="card">
          <div className="card-header">
            <h3>Expenses by Category</h3>
          </div>

          {Object.keys(categoryReport).length === 0 ? (
            <div className="empty-state">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3>No data available</h3>
              <p>Add transactions to see category breakdown</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontSize:14, color:'#7f8c8d'}}>Totals & distribution for selected period</div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn" onClick={() => exportJSON(categoryReport, 'category-report.json')}>Export JSON</button>
                  <button className="btn" onClick={() => {
                    const rows = [['Category','Income','Expense','Net','Pct']].concat(totalByCategory.map(r => [r.category, r.income.toFixed(2), r.expense.toFixed(2), r.net.toFixed(2), r.pct.toFixed(1)+'%']))
                    exportCSV(rows, 'category-report.csv')
                  }}>Export CSV</button>
                  <button className="btn" onClick={() => tryShare('Category report', JSON.stringify(totalByCategory,null,2))}>Share</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 16 }}>
                <div style={{ width: 220 }}>
                  <div style={{ width: 200, height: 200, borderRadius: '50%', background: (() => {
                    const totalSum = totalByCategory.reduce((s,r)=>s+r.total,0) || 1
                    return 'conic-gradient(' + totalByCategory.map((p,i) => {
                      const start = totalByCategory.slice(0,i).reduce((s,a)=>s+a.total,0)/totalSum*100
                      const v = p.total/totalSum*100
                      const end = start + v
                      const color = ['#3498db','#27ae60','#9b59b6','#f39c12','#e74c3c','#2ecc71','#1abc9c','#34495e'][i % 8]
                      return `${color} ${start}% ${end}%`
                    }).join(',') + ')'
                  })() }} />

                  <div style={{ marginTop: 12, fontSize: 13, color: '#7f8c8d' }}>Top categories</div>
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {totalByCategory.slice(0,8).map(r => (
                      <li key={r.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span>{r.category}</span>
                        <span style={{ fontWeight: 600 }}>${r.total.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ flex: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Category</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Income</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Expense</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Net</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Pct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalByCategory.map(r => (
                        <tr key={r.category} style={{ borderBottom: '1px solid #ecf0f1', cursor: 'pointer' }} onClick={() => setOpenCategory(openCategory === r.category ? null : r.category)}>
                          <td style={{ padding: '12px' }}>{r.category}</td>
                          <td style={{ textAlign: 'right', padding: '12px', color: '#27ae60', fontWeight: 500 }}>+${r.income.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '12px', color: '#e74c3c', fontWeight: 500 }}>-${r.expense.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>${r.net.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '12px', fontWeight: 500 }}>{r.pct.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {openCategory && (
                    <div style={{ marginTop: 12 }}>
                      <h4>Transactions — {openCategory}</h4>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {getFilteredTransactions().filter(tx => tx.category === openCategory).map(tx => (
                          <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{tx.note || tx.category}</div>
                              <div style={{ fontSize: 12, color: '#7f8c8d' }}>{tx.account} • {new Date(tx.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700 }}>{tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {reportType === 'wallet' && (
        <div className="card">
          <div className="card-header">
            <h3>Summary by Wallet</h3>
          </div>

          {Object.keys(walletReport).length === 0 ? (
            <div className="empty-state">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3>No wallets available</h3>
              <p>Create a wallet to see wallet summary</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontSize:14, color:'#7f8c8d'}}>Wallet totals and contributions</div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn" onClick={() => exportJSON(walletReport, 'wallet-report.json')}>Export JSON</button>
                  <button className="btn" onClick={() => {
                    const rows = [['Wallet','Income','Expense','Net','Pct']].concat(totalByWallet.map(r => [r.wallet, r.income.toFixed(2), r.expense.toFixed(2), r.net.toFixed(2), r.pct.toFixed(1)+'%']))
                    exportCSV(rows, 'wallet-report.csv')
                  }}>Export CSV</button>
                  <button className="btn" onClick={() => tryShare('Wallet report', JSON.stringify(totalByWallet,null,2))}>Share</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {totalByWallet.map(w => {
                      const max = Math.max(...totalByWallet.map(x=>Math.abs(x.net)), 1)
                      const widthPct = Math.abs(w.net) / max * 100
                      return (
                        <div key={w.wallet} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 140 }}>{w.wallet}</div>
                          <div style={{ flex: 1, background: '#ecf0f1', height: 18, borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenWallet(openWallet === w.wallet ? null : w.wallet)}>
                            <div style={{ width: `${widthPct}%`, height: '100%', background: w.net >= 0 ? '#27ae60' : '#e74c3c' }} />
                          </div>
                          <div style={{ width: 100, textAlign: 'right', fontWeight: 700 }}>${w.net.toFixed(2)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ width: 320 }}>
                  <h4 style={{ marginTop: 0 }}>Wallet breakdown</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Wallet</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Income</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Expense</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalByWallet.map(w => (
                        <tr key={w.wallet} style={{ borderBottom: '1px solid #ecf0f1', cursor:'pointer' }} onClick={() => setOpenWallet(openWallet === w.wallet ? null : w.wallet)}>
                          <td style={{ padding: '12px', fontWeight: 500 }}>{w.wallet}</td>
                          <td style={{ textAlign: 'right', padding: '12px', color: '#27ae60', fontWeight: 500 }}>+${w.income.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '12px', color: '#e74c3c', fontWeight: 500 }}>-${w.expense.toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>${w.net.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {openWallet && (
                    <div style={{ marginTop: 12 }}>
                      <h4>Transactions — {openWallet}</h4>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {getFilteredTransactions().filter(tx => tx.account === openWallet).map(tx => (
                          <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{tx.note || tx.category}</div>
                              <div style={{ fontSize: 12, color: '#7f8c8d' }}>{tx.category} • {new Date(tx.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700 }}>{tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
