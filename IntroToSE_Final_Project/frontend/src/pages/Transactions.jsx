import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { api } from '../lib/api.js'
import { formatMoney } from '../lib/format.js'

export default function Transactions() {
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [walletNameById, setWalletNameById] = React.useState({})

  const qs = React.useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialWalletId = qs.get('walletId') || ''
  const initialQ = qs.get('q') || ''

  const [search, setSearch] = React.useState(initialQ)
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [monthFilter, setMonthFilter] = React.useState(initialWalletId ? 'all' : 'month')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const params = {}
        if (initialWalletId) params.walletId = initialWalletId
        if (initialQ) params.q = initialQ
        const [t, w] = await Promise.all([api.listTransactions(params), api.listWallets()])
        if (!mounted) return
        setItems(Array.isArray(t) ? t : [])

        const wallets = w?.data?.wallets || w?.data || w || []
        const map = {}
        for (const ww of wallets) {
          const id = ww?.id || ww?._id
          if (id) map[id] = ww?.name || String(id)
        }
        setWalletNameById(map)
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWalletId, initialQ])

  const filtered = React.useMemo(() => {
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
    for (const t of items || []) {
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
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-lg bg-border-dark p-1 sm:flex">
              <button
                type="button"
                onClick={() => setMonthFilter('day')}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium ' +
                  (monthFilter === 'day' ? 'bg-surface-border text-white shadow-sm' : 'text-text-secondary')
                }
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setMonthFilter('month')}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium ' +
                  (monthFilter === 'month' ? 'bg-surface-border text-white shadow-sm' : 'text-text-secondary')
                }
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setMonthFilter('year')}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium ' +
                  (monthFilter === 'year' ? 'bg-surface-border text-white shadow-sm' : 'text-text-secondary')
                }
              >
                Yearly
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/transactions/add')}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark shadow-lg shadow-primary/20 hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="whitespace-nowrap">Add Transaction</span>
            </button>
          </div>
        </div>

        {(() => {
          const income = filtered
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + Number(t.amount || 0), 0)
          const expense = filtered
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + Number(t.amount || 0), 0)
          const net = income - expense
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
                <div className="mt-1 text-sm font-medium text-primary">Demo summary</div>
              </div>
              <div className="rounded-xl bg-card-dark p-5 border border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-red-900/30 text-red-400">
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                  </div>
                  <div className="text-sm font-medium text-text-secondary">Total Expense</div>
                </div>
                <div className="mt-3 text-2xl font-bold text-white">-{formatMoney(expense)}</div>
                <div className="mt-1 text-sm font-medium text-red-400">Demo summary</div>
              </div>
              <div className="rounded-xl bg-card-dark p-5 border border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-900/30 text-blue-400">
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  </div>
                  <div className="text-sm font-medium text-text-secondary">Net Balance</div>
                </div>
                <div className="mt-3 text-2xl font-bold text-white">{formatMoney(net)}</div>
                <div className="mt-1 text-sm font-medium text-primary">Demo summary</div>
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
                  const walletLabel = walletNameById[t.walletId] || t.wallet || t.walletId || '—'
                  return (
                    <tr
                      key={t._id || t.id}
                      className="cursor-pointer transition-colors hover:bg-border-dark/50"
                      onClick={() => setSelected(t)}
                    >
                      <td className="px-4 py-4 font-medium text-white">{String(t.date || '').slice(0, 10)}</td>
                      <td className="px-4 py-4 text-text-secondary">{t.type}</td>
                      <td className="px-4 py-4 text-text-secondary">{t.category || '—'}</td>
                      <td className="px-4 py-4 text-text-secondary">{walletLabel}</td>
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
                  <span className="font-medium text-white">{selected.category || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Wallet</span>
                  <span className="font-medium text-white">
                    {walletNameById[selected.walletId] || selected.wallet || selected.walletId || '—'}
                  </span>
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
                  onClick={async () => {
                    const id = selected?._id || selected?.id
                    if (!id) return
                    if (!window.confirm('Delete this transaction?')) return
                    try {
                      await api.deleteTransaction(id)
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
        )}
      </div>
    </div>
  )
}
