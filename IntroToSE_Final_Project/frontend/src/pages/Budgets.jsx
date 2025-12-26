import React from 'react'
import { useNavigate } from 'react-router-dom'

// import { api } from '../lib/api.js'
import { formatMoney } from '../lib/format.js'

export default function Budgets() {
  const navigate = useNavigate()

  const [budgets, setBudgets] = React.useState([])
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.listBudgets()
        const list = res?.data || res || []
        if (!mounted) return
        setBudgets(Array.isArray(list) ? list : [])
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const [filter, setFilter] = React.useState('active')

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount || b.limit || 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0)
  const remaining = Math.max(0, totalBudgeted - totalSpent)

  const shown = budgets.filter((b) => (filter === 'active' ? (b.status || 'active') === 'active' : true))

  const deleteBudget = async (budget) => {
    const id = budget?.id || budget?._id
    if (!id) return
    if (!window.confirm('Delete this budget?')) return
    setBusyId(id)
    setError('')
    try {
      await api.deleteBudget(id)
      setBudgets((prev) => prev.filter((b) => (b.id || b._id) !== id))
    } catch (e) {
      setError(e?.message || 'Failed to delete budget')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Budgets</h1>
            <p className="mt-1 text-sm font-medium text-text-secondary">Manage your spending limits and savings goals.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-12 rounded-lg border border-border-dark bg-card-dark px-4 text-sm font-medium text-white hover:bg-surface-dark"
            >
              September 2023 <span className="material-symbols-outlined align-middle text-[18px]">calendar_month</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/budgets/new')}
              className="h-12 rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110"
            >
              <span className="material-symbols-outlined align-middle text-[20px] mr-1">add</span>
              Create Budget
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-400">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total Budgeted</div>
            </div>
            <div className="mt-3 text-3xl font-bold text-white">{formatMoney(totalBudgeted)}</div>
            <div className="mt-1 text-sm text-text-secondary">For {budgets.length} categories</div>
          </div>
          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-500/10 p-2 text-red-400">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total Spent</div>
            </div>
            <div className="mt-3 text-3xl font-bold text-white">{formatMoney(totalSpent)}</div>
            <div className="mt-1 text-sm font-medium text-primary">+5.2% vs last month</div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">savings</span>
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Remaining</div>
              </div>
              <div className="mt-3 text-3xl font-bold text-white">{formatMoney(remaining)}</div>
              <div className="mt-1 text-sm text-text-secondary">
                {totalBudgeted ? ((remaining / totalBudgeted) * 100).toFixed(0) : 0}% of budget left
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-b border-border-dark">
          <div className="flex gap-8">
            {[
              { k: 'active', label: 'Active', count: shown.length },
              { k: 'completed', label: 'Completed' },
              { k: 'future', label: 'Future' },
            ].map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setFilter(t.k)}
                className={
                  'flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-colors ' +
                  (filter === t.k
                    ? 'border-b-2 border-primary text-primary'
                    : 'border-b-2 border-transparent text-text-secondary hover:text-white')
                }
              >
                {t.label}
                {typeof t.count === 'number' && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
          {error ? (
            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          {shown.map((b) => {
            const limit = Math.max(0.01, Number(b.amount || b.limit || 0))
            const spent = Number(b.spent || 0)
            const pct = Math.min(100, (spent / limit) * 100)
            return (
              <div
                key={b.id || b._id}
                className="rounded-2xl border border-border-dark bg-card-dark p-6 transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-border-dark text-primary">
                      <span className="material-symbols-outlined">{b.icon || 'savings'}</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{b.name}</div>
                      <div className="text-xs text-text-secondary">Period: {b.period || 'monthly'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteBudget(b)}
                    disabled={busyId === (b.id || b._id)}
                    className="text-text-secondary hover:text-white disabled:opacity-60"
                    aria-label="More"
                  >
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="text-2xl font-bold text-white">{formatMoney(spent)}</div>
                  <div className="text-sm font-medium text-text-secondary">of {formatMoney(limit)}</div>
                </div>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-background-dark">
                  <div className="h-2.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-3 flex justify-between text-xs font-medium">
                  <span className="text-primary">{pct.toFixed(0)}% Used</span>
                  <span className="text-text-secondary">{formatMoney(Math.max(0, limit - spent))} Left</span>
                </div>
              </div>
            )
          })}

          {shown.length === 0 && (
            <div className="col-span-full rounded-xl border border-border-dark bg-card-dark p-6 text-text-secondary">
              No budgets yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
