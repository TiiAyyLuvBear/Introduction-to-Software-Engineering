import React from 'react'
import { Link } from 'react-router-dom'

import walletService from '../services/walletService.js'
import goalService from '../services/goalService.js'
import budgetService from '../services/budgetService.js'
import transactionService from '../services/transactionService.js'
import { formatMoney } from '../lib/format.js'

export default function Dashboard() {
  const [cashflowRange, setCashflowRange] = React.useState('month')
  const [cashflowRows, setCashflowRows] = React.useState([])
  const [cashflowBusy, setCashflowBusy] = React.useState(false)
  const [cashflowError, setCashflowError] = React.useState('')
  const [wallets, setWallets] = React.useState([])
  const [goals, setGoals] = React.useState([])
  const [budgets, setBudgets] = React.useState([])
  const [tx, setTx] = React.useState([])

  const cashflowRangeParams = React.useMemo(() => {
    const now = new Date()
    if (cashflowRange === 'year') {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { interval: 'month', startDate: start.toISOString(), endDate: end.toISOString() }
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return { interval: 'day', startDate: start.toISOString(), endDate: end.toISOString() }
  }, [cashflowRange])

  React.useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const [w, g, b, t] = await Promise.all([
            walletService.listWallets(),
            goalService.listGoals(),
            budgetService.listBudgets(),
            transactionService.listTransactions(),
          ])
          if (!mounted) return

          // Handle response wrappers
          const walletsList = w?.data?.wallets || w?.wallets || w?.data || w || []

          // Goals: { success: true, data: [...] }
          const goalsBody = g?.data || g || {}
          const goalsList = Array.isArray(goalsBody) ? goalsBody : (goalsBody.data || [])

          // Budgets: [...]
          const budgetsList = b?.data || b || []

          // Transactions: [...]
          const txList = t?.data || t || []

          setWallets(walletsList)
          setGoals(goalsList)
          setBudgets(budgetsList)
          setTx(txList)
        } catch {
          // keep empty; auth/connection errors handled by login flow
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
      ; (async () => {
        setCashflowBusy(true)
        setCashflowError('')
        try {
          // Calculate cashflow locally
          if (!tx.length) {
            if (mounted) {
              setCashflowRows([])
              setCashflowBusy(false)
            }
            return
          }

          const start = new Date(cashflowRangeParams.startDate)
          const end = new Date(cashflowRangeParams.endDate)
          const interval = cashflowRangeParams.interval

          const filtered = tx.filter(t => {
            const d = new Date(t.date || t.createdAt)
            return d >= start && d <= end
          })

          const groups = {}
          filtered.forEach(t => {
            const d = new Date(t.date || t.createdAt)
            let key = ''
            if (interval === 'month') {
              key = d.toISOString().slice(0, 7)
            } else {
              key = d.toISOString().slice(0, 10)
            }
            if (!groups[key]) groups[key] = { period: key, income: 0, expense: 0 }
            const amount = Number(t.amount || 0)
            if (t.type === 'income') groups[key].income += amount
            if (t.type === 'expense') groups[key].expense += amount
          })

          const calculatedRows = Object.values(groups).sort((a, b) => a.period.localeCompare(b.period))
          const res = { data: calculatedRows }
          const rows = res?.data || res || []
          if (!mounted) return
          setCashflowRows(Array.isArray(rows) ? rows : [])
        } catch (e) {
          if (!mounted) return
          setCashflowRows([])
          setCashflowError(e?.message || 'Failed to load cashflow')
        } finally {
          if (mounted) setCashflowBusy(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [cashflowRangeParams, tx])

  const cashflowChart = React.useMemo(() => {
    const rows = Array.isArray(cashflowRows) ? cashflowRows : []
    const height = 180
    const width = 640

    if (!rows.length) {
      return {
        viewBox: `0 0 ${width} ${height}`,
        incomePath: '',
        expensePath: '',
        incomePoints: [],
        expensePoints: [],
        labels: [],
      }
    }

    const padX = 16
    const padY = 18
    const chartW = width - padX * 2
    const chartH = height - padY * 2

    const maxVal = Math.max(1, ...rows.flatMap((r) => [Number(r.income || 0), Number(r.expense || 0)]))

    const n = rows.length
    const stepX = n <= 1 ? 0 : chartW / (n - 1)
    const yBase = padY + chartH

    const incomePoints = rows.map((r, i) => {
      const v = Number(r.income || 0)
      const x = padX + i * stepX
      const y = yBase - (v / maxVal) * chartH
      return { key: `${r.period}-income`, x, y }
    })
    const expensePoints = rows.map((r, i) => {
      const v = Number(r.expense || 0)
      const x = padX + i * stepX
      const y = yBase - (v / maxVal) * chartH
      return { key: `${r.period}-expense`, x, y }
    })

    const pointsToPath = (pts) => {
      if (!pts.length) return ''
      return pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ')
    }

    const incomePath = pointsToPath(incomePoints)
    const expensePath = pointsToPath(expensePoints)

    const labelEvery = cashflowRange === 'year' ? 1 : Math.ceil(rows.length / 6)
    const labels = rows
      .map((r, i) => ({ period: String(r.period || ''), i }))
      .filter((x) => x.i % labelEvery === 0)
      .map((x) => {
        const x0 = padX + x.i * stepX
        const text = cashflowRange === 'year' ? x.period.slice(5) : x.period.slice(8)
        return { key: x.period, x: x0, text }
      })

    return { viewBox: `0 0 ${width} ${height}`, incomePath, expensePath, incomePoints, expensePoints, labels }
  }, [cashflowRows, cashflowRange])

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance ?? w.currentBalance ?? 0), 0)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthTx = tx.filter((t) => String(t.date || '').slice(0, 7) === currentMonth)
  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
  const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)

  const recent = [...tx]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 6)

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-text-secondary text-sm">Welcome back</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight">Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/transactions/add"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark shadow-lg shadow-primary/20 hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Transaction
            </Link>
            <Link
              to="/reports"
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border-dark bg-border-dark/30 px-4 text-sm font-semibold text-white hover:bg-border-dark/50"
            >
              <span className="material-symbols-outlined text-[20px]">pie_chart</span>
              View Reports
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-text-secondary">Total Balance</div>
                <div className="mt-2 text-3xl font-bold text-white">{formatMoney(totalBalance)}</div>
                <div className="mt-1 text-xs text-text-secondary">Across {wallets.length} wallets</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-text-secondary">Monthly Income</div>
                <div className="mt-2 text-3xl font-bold text-white">{formatMoney(monthIncome)}</div>
                <div className="mt-1 text-xs text-text-secondary">{currentMonth}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-white">
                <span className="material-symbols-outlined">arrow_downward</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-text-secondary">Monthly Expense</div>
                <div className="mt-2 text-3xl font-bold text-white">{formatMoney(monthExpense)}</div>
                <div className="mt-1 text-xs text-text-secondary">{currentMonth}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-white">
                <span className="material-symbols-outlined">arrow_upward</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">Cashflow</div>
                <div className="mt-1 text-sm text-text-secondary">Income vs expenses</div>
              </div>
              <div className="flex rounded-lg bg-border-dark p-1">
                <button
                  className={
                    'px-3 py-1 text-xs font-bold ' +
                    (cashflowRange === 'month'
                      ? 'rounded-md bg-primary text-background-dark'
                      : 'text-text-secondary')
                  }
                  type="button"
                  onClick={() => setCashflowRange('month')}
                >
                  Month
                </button>
                <button
                  className={
                    'px-3 py-1 text-xs font-bold ' +
                    (cashflowRange === 'year' ? 'rounded-md bg-primary text-background-dark' : 'text-text-secondary')
                  }
                  type="button"
                  onClick={() => setCashflowRange('year')}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="mt-6 h-52 rounded-xl border border-border-dark bg-border-dark/20 p-3">
              {cashflowBusy ? (
                <div className="h-full flex items-center justify-center text-sm text-text-secondary">Loading…</div>
              ) : cashflowError ? (
                <div className="h-full flex items-center justify-center text-sm text-red-200">{cashflowError}</div>
              ) : cashflowRows.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-text-secondary">No data yet</div>
              ) : (
                <svg
                  className="h-full w-full"
                  viewBox={cashflowChart.viewBox}
                  role="img"
                  aria-label="Cashflow chart"
                  preserveAspectRatio="none"
                >
                  {/* baseline */}
                  <line x1="0" y1="179" x2="640" y2="179" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
                  {/* lines */}
                  <path d={cashflowChart.incomePath} className="fill-none stroke-current text-primary" strokeWidth="2.5" />
                  <path d={cashflowChart.expensePath} className="fill-none stroke-current text-red-400" strokeWidth="2.5" />

                  {/* points */}
                  {cashflowChart.incomePoints.map((p) => (
                    <circle key={p.key} cx={p.x} cy={p.y} r="2.5" className="fill-current text-primary" />
                  ))}
                  {cashflowChart.expensePoints.map((p) => (
                    <circle key={p.key} cx={p.x} cy={p.y} r="2.5" className="fill-current text-red-400" />
                  ))}

                  {cashflowChart.labels.map((l) => (
                    <text
                      key={l.key}
                      x={l.x}
                      y="176"
                      fontSize="10"
                      fill="rgba(255,255,255,0.45)"
                    >
                      {l.text}
                    </text>
                  ))}
                </svg>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-white">Progress</div>
              <span className="text-xs text-text-secondary">Live</span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Goals</div>
                <div className="text-sm text-text-secondary">{goals.length}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Budgets</div>
                <div className="text-sm text-text-secondary">{budgets.length}</div>
              </div>
              <Link
                to="/savings"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                View savings goals
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-dark bg-card-dark">
          <div className="flex items-center justify-between border-b border-border-dark px-6 py-4">
            <div>
              <div className="text-lg font-bold text-white">Recent transactions</div>
              <div className="mt-1 text-sm text-text-secondary">Latest activity</div>
            </div>
            <Link to="/transactions" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border-dark">
            {recent.map((t) => (
              <div key={t._id || t.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="font-semibold text-white">{t.note || '—'}</div>
                  <div className="text-xs text-text-secondary">
                    {String(t.date || '').slice(0, 10)} • {t.category || '—'}
                  </div>
                </div>
                <div className="font-bold text-white">
                  {(t.type === 'expense' ? '-' : t.type === 'income' ? '+' : '') + formatMoney(Math.abs(Number(t.amount || 0)))}
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="px-6 py-10 text-center text-text-secondary">No transactions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
