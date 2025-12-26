import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import transactionService from '../services/transactionService.js'
import { formatMoney } from '../lib/format.js'

export default function Transactions() {
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = React.useState([])
  const [selected, setSelected] = React.useState(null)

  const qs = React.useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialWalletId = qs.get('walletId') || ''
  const initialQ = qs.get('q') || ''

  const [search, setSearch] = React.useState(initialQ)
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [monthFilter, setMonthFilter] = React.useState(initialWalletId ? 'all' : 'month')
  const [refreshCounter, setRefreshCounter] = React.useState(0)

  // Trigger refresh when navigating back from AddTransaction
  React.useEffect(() => {
    if (location.state?.refresh) {
      setRefreshCounter(prev => prev + 1)
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  React.useEffect(() => {
    let mounted = true
    const fetchTransactions = async () => {
      try {
        const params = {}
        if (initialWalletId) params.walletId = initialWalletId
        if (initialQ) params.q = initialQ
        
        const response = await transactionService.getTransactions(params)
        if(response) {
          console.log('[getTransactions] Response:', response.data);
          console.log('Is array?', Array.isArray(response.data));
          console.log('Type of response.data:', typeof response.data);
        }
        if (!mounted) return
        
        // Backend returns: { status, message, data: [transactions] }
        // But if data is an object, we need to extract the array
        let transactions = response?.data || []
        
        // If data is an object (not array), try to extract transactions
        if (typeof transactions === 'object' && !Array.isArray(transactions)) {
          // Try common field names
          transactions = transactions.transactions || 
                        transactions.data || 
                        transactions.items || 
                        Object.values(transactions) // Convert object values to array as fallback
        }
        
        // Ensure it's an array
        const transactionsArray = Array.isArray(transactions) ? transactions : []
        console.log('Final transactions array:', transactionsArray)
        setItems(transactionsArray)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
        if (mounted) setItems([]) // Set empty array on error
      }
    }
    fetchTransactions()
    return () => { mounted = false }
  }, [initialWalletId, initialQ, refreshCounter])

  const filtered = React.useMemo(() => {
    // Ensure list is always an array
    let list = Array.isArray(items) ? items : []

    if (monthFilter === 'day' || monthFilter === 'month' || monthFilter === 'year') {
      const now = new Date()
      const start =
        monthFilter === 'day'
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
          : monthFilter === 'year'
            ? new Date(now.getFullYear(), 0, 1)
            : new Date(now.getFullYear(), now.getMonth(), 1)
      list = list.filter((t) => {
        const d = new Date(t.date)
        return !Number.isNaN(d.getTime()) && d >= start
      })
    }
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all') list = list.filter((t) => String(t.category || '') === categoryFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((t) => {
        const hay = `${t.note || ''} ${t.category || ''}`.toLowerCase()
        return hay.includes(q)
      })
    }

    return list
  }, [items, monthFilter, typeFilter, categoryFilter, search])

  const uniqueCategories = React.useMemo(() => {
    const set = new Set()
    // Ensure items is an array before iterating
    const itemsArray = Array.isArray(items) ? items : []
    for (const t of itemsArray) {
      if (t?.category) set.add(String(t.category))
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Transactions</h1>
            <p className="text-text-secondary">View and manage your financial activity.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-1">Transactions</h2>
        <p className="text-gray-600">Manage your income and expenses</p>
      </div>

<<<<<<< Updated upstream
      {/* Buttons & Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Transaction
        </button>
        <button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
          onClick={() => setShowTransfer(true)}
        >
          <FaExchangeAlt /> Transfer
        </button>
        <input
          type="search"
          className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {loading || isSearching ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <FaMoneyBillWave className="text-5xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
            <p>Add your first transaction!</p>
          </div>
        ) : (
          transactions
            .filter(tx => {
              const term = searchTerm.trim().toLowerCase()
              if (!term) return true
              return [tx.category, tx.note, tx.account, tx.type, String(tx.amount)].join(' ').toLowerCase().includes(term)
            })
            .map(tx => (
              <motion.div
                key={tx._id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex justify-between items-center p-5 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center gap-4" onClick={() => setSelectedTransaction(tx)}>
                  <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:rotate-6 ${tx.type==='income'?'bg-gradient-to-br from-green-400 to-green-600 text-white':'bg-gradient-to-br from-red-400 to-red-600 text-white'}`}>
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">{tx.category}</div>
                    <div className="text-gray-600 text-sm font-medium">{tx.note} • {tx.account}</div>
=======
        {(() => {
          const income = filtered
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + Number(t.amount || 0), 0)
          const expense = filtered
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + Number(t.amount || 0), 0)
          const net = income - expense

		  const incomeCount = filtered.filter((t) => t.type === 'income').length
		  const expenseCount = filtered.filter((t) => t.type === 'expense').length
          return (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-card-dark p-5 border border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-green-900/30 text-primary">
                    <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                  </div>
                  <div className="text-sm font-medium text-text-secondary">Total Income</div>
                </div>
                <div className="mt-3 text-2xl font-bold text-white">+{formatMoney(income)}</div>
                <div className="mt-1 text-sm font-medium text-primary">{incomeCount}</div>
              </div>
              <div className="rounded-xl bg-card-dark p-5 border border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-red-900/30 text-red-400">
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
>>>>>>> Stashed changes
                  </div>
                </div>
<<<<<<< Updated upstream
                <div className="flex items-center gap-3">
                  <div className={`${tx.type==='income'?'text-green-600':'text-red-600'} font-bold text-xl`}>
                    {tx.type==='expense'?'-':'+'}${tx.amount.toFixed(2)}
=======
                <div className="mt-3 text-2xl font-bold text-white">-{formatMoney(expense)}</div>
                <div className="mt-1 text-sm font-medium text-red-400">{expenseCount}</div>
              </div>
              <div className="rounded-xl bg-card-dark p-5 border border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-900/30 text-blue-400">
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
>>>>>>> Stashed changes
                  </div>
                  <button onClick={() => handleDelete(tx._id)} className="p-2 rounded-xl hover:bg-red-100 text-red-600 hover:scale-110 transition-all duration-200">
                    <FaRegTrashAlt />
                  </button>
                </div>
<<<<<<< Updated upstream
              </motion.div>
            ))
=======
                <div className="mt-3 text-2xl font-bold text-white">{formatMoney(net)}</div>
                <div className="mt-1 text-sm font-medium text-primary">{filtered.length}</div>
              </div>
            </div>
          )
        })()}

        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-card-dark p-4 border border-border-dark">
          <div className="flex flex-wrap items-center gap-3 border-b border-border-dark pb-4">
            <label className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-text-secondary">search</span>
              <input
                className="h-10 min-w-[240px] w-full rounded-lg border-0 bg-border-dark pl-10 pr-4 text-sm text-white placeholder:text-text-secondary focus:ring-2 focus:ring-primary outline-none"
                placeholder="Search transactions..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={() => setMonthFilter((v) => (v === 'month' ? 'all' : 'month'))}
              className="flex h-10 items-center gap-2 rounded-lg border border-surface-border bg-border-dark px-4 text-sm font-medium text-white"
            >
              {monthFilter === 'month' ? 'This Month' : 'All Time'}
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter((v) => (v === 'all' ? 'income' : v === 'income' ? 'expense' : 'all'))}
              className="flex h-10 items-center gap-2 rounded-lg border border-surface-border bg-border-dark px-4 text-sm font-medium text-white"
            >
              Type: {typeFilter === 'all' ? 'All' : typeFilter}
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!uniqueCategories.length) return
                if (categoryFilter === 'all') return setCategoryFilter(uniqueCategories[0])
                const idx = uniqueCategories.indexOf(categoryFilter)
                const next = uniqueCategories[(idx + 1) % uniqueCategories.length]
                setCategoryFilter(next)
              }}
              className="flex h-10 items-center gap-2 rounded-lg border border-surface-border bg-border-dark px-4 text-sm font-medium text-white"
            >
              Category: {categoryFilter === 'all' ? 'All' : categoryFilter}
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            {categoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className="flex h-10 items-center gap-2 rounded-lg border border-surface-border bg-border-dark px-4 text-sm font-medium text-text-secondary hover:text-white"
              >
                Clear Category
              </button>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Wallet</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filtered.map((t) => {
                  const isExpense = t.type === 'expense'
                  const isIncome = t.type === 'income'
                  const sign = isExpense ? '-' : isIncome ? '+' : ''
                  return (
                    <tr
                      key={t._id || t.id}
                      className="cursor-pointer transition-colors hover:bg-border-dark/50"
                      onClick={() => setSelected(t)}
                    >
                      <td className="px-4 py-4 font-medium text-white">{String(t.date || '').slice(0, 10)}</td>
                      <td className="px-4 py-4 text-text-secondary">{t.type}</td>
                      <td className="px-4 py-4 text-text-secondary">{t.category || 'Uncategorized'}</td>
                      <td className="px-4 py-4 text-text-secondary">Uncategorized</td>
                      <td className="px-4 py-4 text-right font-bold text-white">
                        {sign}{formatMoney(Math.abs(Number(t.amount || 0)))}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-text-secondary" colSpan={5}>
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-border-dark bg-card-dark p-5 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-white">Transaction Details</div>
                  <div className="mt-1 text-sm text-text-secondary">ID: {selected._id || selected.id}</div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border-dark px-3 py-1.5 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Date</span>
                  <span className="font-medium text-white">{String(selected.date || '').slice(0, 10)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Type</span>
                  <span className="font-medium text-white">{selected.type}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Category</span>
                  <span className="font-medium text-white">{selected.category || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Wallet</span>
                  <span className="font-medium text-white">Uncategorized</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-semibold text-white">
                    {(selected.type === 'expense' ? '-' : selected.type === 'income' ? '+' : '') +
                      formatMoney(Math.abs(Number(selected.amount || 0)))}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Note</span>
                  <span className="font-medium text-white">{selected.note || '—'}</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border-dark px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                  onClick={() => {
                    const id = selected?._id || selected?.id
                    if (!id) return
                    setSelected(null)
                    navigate(`/transactions/${encodeURIComponent(id)}/edit`, { state: { tx: selected } })
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border-dark px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                  onClick={async () => {
                    const id = selected?._id || selected?.id
                    if (!id) return
                    if (!window.confirm('Delete this transaction?')) return
                    try {
                      await transactionService.deleteTransaction(id)
                      setItems((prev) => prev.filter((x) => (x._id || x.id) !== id))
                      setSelected(null)
                    } catch (e) {
                      window.alert(e?.message || 'Failed to delete')
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
>>>>>>> Stashed changes
        )}
      </div>

      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

      {/* === Add Transaction Modal === */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add Transaction</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Type Card */}
                <div className="grid grid-cols-2 gap-2">
                  {['income','expense'].map(type => (
                    <div
                      key={type}
                      onClick={()=>setValue('type', type)}
                      className={`flex items-center justify-center py-3 rounded-xl cursor-pointer font-semibold text-white transition-all duration-200 ${
                        watch('type')===type
                          ? type==='income' ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg scale-105' : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase()+type.slice(1)}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input {...register('category',{ required:true })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  {errors.category && <span className="text-red-500 text-sm">Category required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input type="number" {...register('amount',{ required:true, min:0.01 })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  {errors.amount && <span className="text-red-500 text-sm">Valid amount required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" {...register('date',{ required:true })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account</label>
                  <select {...register('account')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Bank Account</option>
                    <option>Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <textarea {...register('note')} rows={3} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold">Save</button>
                  <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Transfer Modal === */}
      <AnimatePresence>
        {showTransfer && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTransfer(false)}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaExchangeAlt /> Transfer Funds</h3>

              <form onSubmit={handleSubmitTransfer(onSubmitTransfer)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <select {...registerTransfer('from')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Bank Account</option>
                    <option>Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <select {...registerTransfer('to')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Bank Account</option>
                    <option>Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input type="number" {...registerTransfer('amount',{ required:true, min:0.01 })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" {...registerTransfer('date',{ required:true })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <input type="text" {...registerTransfer('note')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all font-semibold">Confirm</button>
                  <button type="button" onClick={()=>setShowTransfer(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
