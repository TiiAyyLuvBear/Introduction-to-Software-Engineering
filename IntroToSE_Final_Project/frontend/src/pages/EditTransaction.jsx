import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

// import { api } from '../lib/api.js'
import FormattedNumberInput from '../components/FormattedNumberInput.jsx'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export default function EditTransaction() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  const [tx, setTx] = React.useState(location.state?.tx || null)
  const [categories, setCategories] = React.useState([])
  const [wallets, setWallets] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [permissionBlocked, setPermissionBlocked] = React.useState(false)

  const [type, setType] = React.useState('expense')
  const [amount, setAmount] = React.useState('')
  const [amountNum, setAmountNum] = React.useState(NaN)
  const [categoryId, setCategoryId] = React.useState('')
  const [walletId, setWalletId] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // const [catsRes, walletsRes] = await Promise.all([
        //   api.listCategories({ page: 1, limit: 200 }),
        //   api.listWallets(),
        // ])
        // const items = catsRes?.items || []
        // const walletsList = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []
        if (!mounted) return
        // setCategories(Array.isArray(items) ? items : [])
        // const all = Array.isArray(walletsList) ? walletsList : []
        // const editable = all.filter((w) => {
        //   const p = w?.myPermission
        //   return p === 'owner' || p === 'edit'
        // })
        // setWallets(editable)
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    if (tx) return
    let mounted = true
    ;(async () => {
      try {
        // const list = await api.listTransactions({ limit: 200 })
        // const found = (Array.isArray(list) ? list : []).find((t) => (t._id || t.id) === id)
        if (!mounted) return
        // if (!found) {
        //   setError('Transaction not found')
        //   return
        // }
        // setTx(found)
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Failed to load transaction')
      }
    })()
    return () => {
      mounted = false
    }
  }, [id, tx])

  React.useEffect(() => {
    if (!tx) return
    setType(tx.type || 'expense')
    setAmount(String(tx.amount ?? ''))
    setAmountNum(Number(tx.amount))
    setCategoryId(tx.categoryId || '')
    setWalletId(tx.walletId || '')
    setDate(String(tx.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10))
    setNote(tx.note || '')
  }, [tx])

  React.useEffect(() => {
    if (!tx) return
    if (type === 'transfer') {
      setError('Transfer transactions cannot be edited here.')
    } else {
      if (!permissionBlocked) setError('')
    }
  }, [type, tx, permissionBlocked])

  React.useEffect(() => {
    if (!tx) return
    const wid = tx.walletId
    if (!wid) return
    const ok = wallets.some((w) => String(w.id || w._id) === String(wid))
    if (!ok) {
      setPermissionBlocked(true)
      setError('You do not have permission to edit transactions in this wallet.')
    } else {
      setPermissionBlocked(false)
    }
  }, [tx, wallets])

  const submit = (e) => {
    e.preventDefault()

    if (!tx) return
    if (type === 'transfer') return
    if (permissionBlocked) return

    setError('')
    if (!walletId) {
      setError('Please select a wallet')
      return
    }

    setBusy(true)
    ;(async () => {
      try {
        const category = categories.find((c) => c._id === categoryId)
        // await api.updateTransaction(id, {
        //   amount: Math.abs(Number.isFinite(amountNum) ? amountNum : toNumber(amount)),
        //   type,
        //   walletId,
        //   categoryId: categoryId || undefined,
        //   category: category?.name || tx?.category,
        //   date,
        //   note,
        // })
        // navigate('/transactions')
        setError('API call disabled - updateTransaction()')
      } catch (e2) {
        setError(e2?.message || 'Failed to update transaction')
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
            <h1 className="text-3xl font-black tracking-tight">Edit Transaction</h1>
            <p className="mt-1 text-text-secondary">Update an existing entry.</p>
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
            <div className="mb-4 mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
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
              <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </label>

            <button
              type="submit"
              disabled={busy || !tx || permissionBlocked}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
