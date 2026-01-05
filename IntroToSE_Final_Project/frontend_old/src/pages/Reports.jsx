import React, { useState, useEffect } from 'react'
import { BarChart3, Wallet, FileText, Download, Share2, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react'
import Chatbot from '../components/chatbot/Chatbot.jsx'

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
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7" />
              Expenses by Category
            </h3>
          </div>

          {Object.keys(categoryReport).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <BarChart3 className="w-20 h-20 text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No data available</h3>
              <p className="text-gray-500 text-center">Add transactions to see category breakdown</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="text-sm text-gray-600 font-medium">Totals & distribution for selected period</div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    onClick={() => exportJSON(categoryReport, 'category-report.json')}
                  >
                    <FileText className="w-4 h-4" /> JSON
                  </button>
                  <button 
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    onClick={() => {
                      const rows = [['Category','Income','Expense','Net','Pct']].concat(totalByCategory.map(r => [r.category, r.income.toFixed(2), r.expense.toFixed(2), r.net.toFixed(2), r.pct.toFixed(1)+'%']))
                      exportCSV(rows, 'category-report.csv')
                    }}
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    onClick={() => tryShare('Category report', JSON.stringify(totalByCategory,null,2))}
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-64 flex-shrink-0">
                  <div className="w-full aspect-square rounded-full shadow-xl mx-auto" style={{ background: (() => {
                    const totalSum = totalByCategory.reduce((s,r)=>s+r.total,0) || 1
                    return 'conic-gradient(' + totalByCategory.map((p,i) => {
                      const start = totalByCategory.slice(0,i).reduce((s,a)=>s+a.total,0)/totalSum*100
                      const v = p.total/totalSum*100
                      const end = start + v
                      const color = ['#3498db','#27ae60','#9b59b6','#f39c12','#e74c3c','#2ecc71','#1abc9c','#34495e'][i % 8]
                      return `${color} ${start}% ${end}%`
                    }).join(',') + ')'
                  })() }} />

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Categories</h4>
                    <ul className="space-y-2">
                      {totalByCategory.slice(0,8).map((r, idx) => (
                        <li key={r.category} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: ['#3498db','#27ae60','#9b59b6','#f39c12','#e74c3c','#2ecc71','#1abc9c','#34495e'][idx % 8] }}
                            />
                            <span className="text-gray-700 font-medium">{r.category}</span>
                          </div>
                          <span className="font-bold text-gray-900">${r.total.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex-1 w-full overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="text-left py-4 px-4 font-bold text-gray-700">Category</th>
                        <th className="text-right py-4 px-4 font-bold text-gray-700">Income</th>
                        <th className="text-right py-4 px-4 font-bold text-gray-700">Expense</th>
                        <th className="text-right py-4 px-4 font-bold text-gray-700">Net</th>
                        <th className="text-right py-4 px-4 font-bold text-gray-700">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalByCategory.map(r => (
                        <tr 
                          key={r.category} 
                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                          onClick={() => setOpenCategory(openCategory === r.category ? null : r.category)}
                        >
                          <td className="py-3 px-4 font-medium text-gray-800">{r.category}</td>
                          <td className="text-right py-3 px-4 text-green-600 font-semibold">+${r.income.toFixed(2)}</td>
                          <td className="text-right py-3 px-4 text-red-600 font-semibold">-${r.expense.toFixed(2)}</td>
                          <td className="text-right py-3 px-4 font-bold text-gray-900">${r.net.toFixed(2)}</td>
                          <td className="text-right py-3 px-4 font-semibold text-gray-700">{r.pct.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {openCategory && (
                    <div className="mt-6 bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200 shadow-md">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Transactions — {openCategory}
                      </h4>
                      <div className="max-h-80 overflow-y-auto space-y-3">
                        {getFilteredTransactions().filter(tx => tx.category === openCategory).map(tx => (
                          <div key={tx._id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div>
                              <div className="font-semibold text-gray-800">{tx.note || tx.category}</div>
                              <div className="text-xs text-gray-500 mt-1">{tx.account} • {new Date(tx.date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                              </div>
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
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Wallet className="w-7 h-7" />
              Summary by Wallet
            </h3>
          </div>

          {Object.keys(walletReport).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Briefcase className="w-20 h-20 text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No wallets available</h3>
              <p className="text-gray-500 text-center">Create a wallet to see wallet summary</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="text-sm text-gray-600 font-medium">Wallet totals and contributions</div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    onClick={() => exportJSON(walletReport, 'wallet-report.json')}
                  >
                    <FileText className="w-4 h-4" /> JSON
                  </button>
                  <button 
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    onClick={() => {
                      const rows = [['Wallet','Income','Expense','Net','Pct']].concat(totalByWallet.map(r => [r.wallet, r.income.toFixed(2), r.expense.toFixed(2), r.net.toFixed(2), r.pct.toFixed(1)+'%']))
                      exportCSV(rows, 'wallet-report.csv')
                    }}
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    onClick={() => tryShare('Wallet report', JSON.stringify(totalByWallet,null,2))}
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Visual Progress</h4>
                  <div className="space-y-4">
                    {totalByWallet.map(w => {
                      const max = Math.max(...totalByWallet.map(x=>Math.abs(x.net)), 1)
                      const widthPct = Math.abs(w.net) / max * 100
                      return (
                        <div key={w.wallet} className="group">
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                            <div className="w-32 font-semibold text-gray-700 truncate">{w.wallet}</div>
                            <div 
                              className="flex-1 bg-gray-200 h-6 rounded-full overflow-hidden cursor-pointer shadow-inner hover:shadow-md transition-shadow duration-200" 
                              onClick={() => setOpenWallet(openWallet === w.wallet ? null : w.wallet)}
                            >
                              <div 
                                className={`h-full transition-all duration-500 ${w.net >= 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                            <div className="w-28 text-right font-bold text-gray-900">${w.net.toFixed(2)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="w-full lg:w-96 flex-shrink-0">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Wallet Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <th className="text-left py-3 px-4 font-bold text-gray-700">Wallet</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-700">Income</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-700">Expense</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-700">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {totalByWallet.map(w => (
                          <tr 
                            key={w.wallet} 
                            className="border-b border-gray-200 hover:bg-green-50 cursor-pointer transition-all duration-200"
                            onClick={() => setOpenWallet(openWallet === w.wallet ? null : w.wallet)}
                          >
                            <td className="py-3 px-4 font-semibold text-gray-800">{w.wallet}</td>
                            <td className="text-right py-3 px-4 text-green-600 font-semibold">+${w.income.toFixed(2)}</td>
                            <td className="text-right py-3 px-4 text-red-600 font-semibold">-${w.expense.toFixed(2)}</td>
                            <td className="text-right py-3 px-4 font-bold text-gray-900">${w.net.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {openWallet && (
                    <div className="mt-6 bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-200 shadow-md">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-600" />
                        Transactions — {openWallet}
                      </h4>
                      <div className="max-h-80 overflow-y-auto space-y-3">
                        {getFilteredTransactions().filter(tx => tx.account === openWallet).map(tx => (
                          <div key={tx._id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div>
                              <div className="font-semibold text-gray-800">{tx.note || tx.category}</div>
                              <div className="text-xs text-gray-500 mt-1">{tx.category} • {new Date(tx.date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                              </div>
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

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
