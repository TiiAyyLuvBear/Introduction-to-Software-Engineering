import React from 'react'
import { useNavigate } from 'react-router-dom'

import transactionService from '../services/transactionService.js'
import FormattedNumberInput from '../components/FormattedNumberInput.jsx'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export default function AddTransaction() {
  const navigate = useNavigate()

  const [categories, setCategories] = React.useState([])
  const [wallets, setWallets] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [catsRes, walletsRes] = await Promise.all([
          api.listCategories({ page: 1, limit: 200 }),
          api.listWallets(),
        ])
        const items = catsRes?.items || []
        const walletsList = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []

        if (!mounted) return
        setCategories(Array.isArray(items) ? items : [])
        setWallets(Array.isArray(walletsList) ? walletsList : [])
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const [type, setType] = React.useState('expense')
  const [amount, setAmount] = React.useState('')
  const [amountNum, setAmountNum] = React.useState(NaN)
  const [categoryId, setCategoryId] = React.useState('')
  const [walletId, setWalletId] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = React.useState('')

  React.useEffect(() => {
    if (!walletId && wallets.length) setWalletId(wallets[0]?.id || wallets[0]?._id || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets])

  React.useEffect(() => {
    if (type === 'transfer') {
      navigate('/transactions/transfer', { replace: true })
      return
    }
    const next = categories.find((c) => c.type === type)?._id || ''
    setCategoryId(next)
  }, [type, categories, navigate])

  const submit = (e) => {
    e.preventDefault()

    setError('')
    // if (!walletId) {
    //   setError('Please select a wallet')
    //   return
    // }
    setBusy(true)
    ;(async () => {
      try {
        const category = categories.find((c) => c._id === categoryId)
        await transactionService.createTransaction({
          amount: Math.abs(Number.isFinite(amountNum) ? amountNum : toNumber(amount)),
          type,
          walletId: walletId || undefined,
          categoryId: categoryId || undefined,
          category: category?.name,
          date,
          note,
        })
        // Navigate with state to trigger refresh
        navigate('/transactions', { state: { refresh: true } })
      } catch (e2) {
        setError(e2?.message || 'Failed to create transaction')
      } finally {
        setBusy(false)
      }
    })()
  }

  const inputClass =
    'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Add Transaction</h1>
            <p className="mt-1 text-text-secondary">Create an expense or income entry.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="rounded-lg border border-border-dark bg-transparent px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
          <div className="flex rounded-lg bg-border-dark p-1">
            {[
              { v: 'expense', label: 'Expense', icon: 'trending_down' },
              { v: 'income', label: 'Income', icon: 'trending_up' },
              { v: 'transfer', label: 'Transfer', icon: 'swap_horiz' },
            ].map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setType(t.v)}
                className={
                  'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors ' +
                  (type === t.v ? 'bg-background-dark text-white' : 'text-text-secondary hover:text-white')
                }
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Amount</span>
              <FormattedNumberInput
                inputClassName={inputClass}
                value={amount}
                decimals={2}
                placeholder="0.00"
                required
                onChangeValue={(n, raw) => {
                  setAmount(raw)
                  setAmountNum(n)
                }}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Category</span>
              <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories
                  .filter((c) => c.type === type)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Wallet</span>
              <select className={inputClass} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                {wallets.map((w) => (
                  <option key={w.id || w._id} value={w.id || w._id}>
                    {w.name} ({w.currency || 'USD'})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Date</span>
              <input className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Note</span>
              <input
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
