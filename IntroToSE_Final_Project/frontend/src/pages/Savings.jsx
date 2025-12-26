import React from 'react'
import { useNavigate } from 'react-router-dom'

// import { api } from '../lib/api.js'
import FormattedNumberInput from '../components/FormattedNumberInput.jsx'
import { formatMoney } from '../lib/format.js'

export default function Savings() {
  const navigate = useNavigate()

  const [goals, setGoals] = React.useState([])
  const [wallets, setWallets] = React.useState([])
  const [expandedGoalId, setExpandedGoalId] = React.useState(null)
  const [contributeGoalId, setContributeGoalId] = React.useState(null)
  const [contributeAmount, setContributeAmount] = React.useState('')
  const [contributeAmountNum, setContributeAmountNum] = React.useState(NaN)
  const [contributeWalletId, setContributeWalletId] = React.useState('')
  const [contributeNote, setContributeNote] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [res, walletsRes] = await Promise.all([api.listGoals(), api.listWallets()])
        const list = res?.data || res || []
        const walletsList = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []
        if (!mounted) return
        setGoals(Array.isArray(list) ? list : [])
        setWallets(Array.isArray(walletsList) ? walletsList : [])
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const total = goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0)

  const recent = [
    { id: 'r1', title: 'Auto-save Deposit', when: 'Today, 9:00 AM', amount: 50, icon: 'savings' },
    { id: 'r2', title: 'Japan Trip', when: 'Yesterday', amount: 120, icon: 'flight' },
    { id: 'r3', title: 'Emergency Fund', when: 'Oct 24, 2023', amount: 500, icon: 'health_and_safety' },
  ]

  const startContribute = (goal) => {
    const id = goal?.id || goal?._id
    setError('')
    setContributeGoalId(id)
    setContributeAmount('')
    setContributeAmountNum(NaN)
    setContributeNote('')
    const preferred = goal?.walletId || wallets[0]?.id || wallets[0]?._id || ''
    setContributeWalletId(preferred)
  }

  const submitContribution = async (e) => {
    e.preventDefault()
    if (!contributeGoalId) return
    const amount = Number.isFinite(contributeAmountNum) ? contributeAmountNum : Number(contributeAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (!contributeWalletId) {
      setError('Select a wallet')
      return
    }

    setBusy(true)
    setError('')
    try {
      const res = await api.contributeToGoal(contributeGoalId, {
        amount,
        walletId: contributeWalletId,
        note: contributeNote || undefined,
        date: new Date().toISOString(),
      })
      const updated = res?.data?.goal || res?.data?.data?.goal || res?.data || null
      if (updated) {
        setGoals((prev) => prev.map((g) => ((g.id || g._id) === contributeGoalId ? { ...g, ...updated } : g)))
      }
      setContributeGoalId(null)
      setContributeAmount('')
      setContributeAmountNum(NaN)
    } catch (e2) {
      setError(e2?.message || 'Failed to add money')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Savings Goals</h1>
            <p className="mt-2 text-text-secondary">Track your progress and reach your financial targets.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/savings/new')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-background-dark hover:brightness-110"
          >
            <span className="material-symbols-outlined">add</span>
            Create New Goal
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border-dark bg-border-dark p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">Total Balance</div>
              <span className="material-symbols-outlined text-text-secondary">account_balance</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{formatMoney(total)}</div>
            <div className="mt-3 inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +5.2% this month
            </div>
          </div>

          <div className="rounded-xl border border-border-dark bg-border-dark p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">Monthly Rate</div>
              <span className="material-symbols-outlined text-text-secondary">speed</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-white">15%</div>
            <div className="mt-3 inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              +2.1% vs last month
            </div>
          </div>

          <div className="rounded-xl border border-border-dark bg-border-dark p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">Goals Active</div>
              <span className="material-symbols-outlined text-text-secondary">flag</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{goals.length}</div>
            <div className="mt-3 text-sm font-medium text-white/60">Demo stat</div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {goals.map((g) => {
              const current = Number(g.currentAmount || 0)
              const target = Math.max(0.01, Number(g.targetAmount || 0))
              const pct = Math.min(100, (current / target) * 100)
              const gid = g.id || g._id
              const isExpanded = expandedGoalId === gid
              const isContribute = contributeGoalId === gid
              return (
                <div
                  key={g.id || g._id}
                  className="rounded-2xl border border-border-dark bg-card-dark overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white text-xl font-bold">{g.name}</div>
                        <div className="text-sm text-text-secondary">
                          {g.deadline ? `Target: ${String(g.deadline).slice(0, 10)}` : 'No target date'}
                        </div>
                      </div>
                      <div className="rounded-full bg-border-dark p-2 text-primary">
                        <span className="material-symbols-outlined">{g.icon || 'flag'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-white">{formatMoney(current)}</span>
                        <span className="text-text-secondary">{formatMoney(Number(g.targetAmount || 0))}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-background-dark">
                        <div className="h-3 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-right text-xs font-bold text-primary">{pct.toFixed(0)}%</div>
                    </div>

                    <div className="flex gap-3 border-t border-border-dark pt-3">
                      <button
                        type="button"
                        onClick={() => setExpandedGoalId((v) => (v === gid ? null : gid))}
                        className="flex-1 rounded-lg bg-border-dark py-2 text-sm font-medium text-white hover:bg-surface-border"
                      >
                        {isExpanded ? 'Hide Details' : 'Details'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startContribute(g)}
                        className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-background-dark hover:brightness-110"
                      >
                        Add Money
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="rounded-xl border border-border-dark bg-background-dark/20 p-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Remaining</span>
                          <span className="font-semibold text-white">{formatMoney(Number(g.remaining || Math.max(0, target - current)))}</span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4">
                          <span className="text-text-secondary">Monthly Target</span>
                          <span className="font-semibold text-white">{formatMoney(Number(g.monthlyTarget || 0))}</span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4">
                          <span className="text-text-secondary">Status</span>
                          <span className="font-semibold text-white">{g.status || 'active'}</span>
                        </div>
                      </div>
                    )}

                    {isContribute && (
                      <form onSubmit={submitContribution} className="rounded-xl border border-border-dark bg-background-dark/20 p-4">
                        {error ? (
                          <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {error}
                          </div>
                        ) : null}
                        <div className="grid gap-3">
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold text-text-secondary">Wallet</span>
                            <select
                              className="h-10 w-full rounded-lg bg-surface-dark border border-input-border px-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              value={contributeWalletId}
                              onChange={(e) => setContributeWalletId(e.target.value)}
                              required
                            >
                              {wallets.map((w) => (
                                <option key={w.id || w._id} value={w.id || w._id}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold text-text-secondary">Amount</span>
                            <FormattedNumberInput
                              inputClassName="h-10 w-full rounded-lg bg-surface-dark border border-input-border px-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              value={contributeAmount}
                              decimals={2}
                              placeholder="0.00"
                              required
                              min={0}
                              onChangeValue={(n, raw) => {
                                setContributeAmount(raw)
                                setContributeAmountNum(n)
                              }}
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold text-text-secondary">Note</span>
                            <input
                              className="h-10 w-full rounded-lg bg-surface-dark border border-input-border px-3 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              value={contributeNote}
                              onChange={(e) => setContributeNote(e.target.value)}
                              placeholder="Optional"
                            />
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={busy}
                              className="flex-1 h-10 rounded-lg bg-primary text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                            >
                              {busy ? 'Adding…' : 'Add Money'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setContributeGoalId(null)}
                              className="h-10 rounded-lg border border-border-dark px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={() => navigate('/savings/new')}
              className="min-h-[300px] rounded-2xl border-2 border-dashed border-border-dark bg-background-dark/10 hover:border-primary/50 hover:bg-card-dark transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-border-dark text-white">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">Create New Goal</div>
                <div className="text-sm text-text-secondary">Start saving for something new</div>
              </div>
            </button>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-white">Recent Contributions</div>
                  <button
                    type="button"
                    onClick={() => navigate('/transactions')}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                  View All
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 border-b border-border-dark pb-3">
                    <div className="rounded-lg bg-border-dark p-2 text-primary">
                      <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{r.title}</div>
                      <div className="text-xs text-text-secondary">{r.when}</div>
                    </div>
                    <div className="text-sm font-bold text-primary">+{formatMoney(Math.abs(r.amount))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
