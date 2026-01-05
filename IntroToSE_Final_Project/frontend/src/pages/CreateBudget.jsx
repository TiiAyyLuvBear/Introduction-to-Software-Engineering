import React from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api.js'
import FormattedNumberInput from '../components/FormattedNumberInput.jsx'

export default function CreateBudget() {
  const navigate = useNavigate()

  const [categories, setCategories] = React.useState([])
  const [wallets, setWallets] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [catsRes, walletsRes] = await Promise.all([api.listCategories({ page: 1, limit: 100 }), api.listWallets()])

        const walletsList = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes || []
        const all = Array.isArray(walletsList) ? walletsList : []
        const editable = all.filter((w) => {
          const p = w?.myPermission
          return p === 'owner' || p === 'edit'
        })
        if (mounted) setWallets(editable)

        const items = catsRes?.items || []
        if (!mounted) return
        setCategories(Array.isArray(items) ? items.filter((c) => c.type === 'expense') : [])
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const [name, setName] = React.useState('')
  const [walletId, setWalletId] = React.useState('')
  const [categoryId, setCategoryId] = React.useState('')
  const [period, setPeriod] = React.useState('monthly')
  const [limit, setLimit] = React.useState('')
  const [limitNum, setLimitNum] = React.useState(NaN)

  React.useEffect(() => {
    if (!categoryId && categories.length) setCategoryId(categories[0]?._id || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  React.useEffect(() => {
    if (!walletId && wallets.length) setWalletId(wallets[0]?.id || wallets[0]?._id || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets])

  const inputClass =
    'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

  const submit = (e) => {
    e.preventDefault()

    if (!walletId) {
      setError('You do not have any wallets with edit permission')
      return
    }

    setError('')
    setBusy(true)
    ;(async () => {
      try {
        const amount = Number.isFinite(limitNum) ? limitNum : Number(limit) || 0
        if (!(amount > 0)) {
          setError('Spending limit must be greater than 0')
          return
        }
        await api.createBudget({
          walletId: walletId || undefined,
          name: name.trim() || undefined,
          categoryId: categoryId || undefined,
          amount,
          period,
          startDate: new Date().toISOString(),
        })
        navigate('/budgets')
      } catch (e2) {
        setError(e2?.message || 'Failed to create budget')
      } finally {
        setBusy(false)
      }
    })()
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create Budget</h1>
            <p className="mt-1 text-text-secondary">Set a spending limit for a category.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/budgets')}
            className="rounded-lg border border-border-dark bg-transparent px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
              {error}
            </div>
          ) : null}
          <form onSubmit={submit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Wallet</span>
              <select className={inputClass} value={walletId} onChange={(e) => setWalletId(e.target.value)} required>
                {wallets.length ? (
                  wallets.map((w) => (
                    <option key={w.id || w._id} value={w.id || w._id}>
                      {w.name}
                    </option>
                  ))
                ) : (
                  <option value="">No editable wallets</option>
                )}
              </select>
              {!wallets.length ? (
                <div className="text-xs text-text-secondary">You need owner/edit permission to create budgets in a shared wallet.</div>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Budget name</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Category</span>
              <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.length ? (
                  categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="">No categories</option>
                )}
              </select>
            </label>

            <div className="grid gap-2">
              <div className="text-sm font-medium text-white">Period</div>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { v: 'weekly', label: 'Weekly' },
                  { v: 'monthly', label: 'Monthly' },
                  { v: 'yearly', label: 'Yearly' },
                ].map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => setPeriod(p.v)}
                    className={
                      'h-12 rounded-lg border text-sm font-bold transition-colors ' +
                      (period === p.v
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-dark bg-surface-dark text-text-secondary hover:text-white')
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Spending limit</span>
              <FormattedNumberInput
                inputClassName={inputClass}
                value={limit}
                decimals={2}
                placeholder="0.00"
                required
                min={0.01}
                onChangeValue={(n, raw) => {
                  setLimit(raw)
                  setLimitNum(n)
                }}
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create budget'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
