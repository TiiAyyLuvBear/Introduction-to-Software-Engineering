import React from 'react'
import { useNavigate } from 'react-router-dom'

// import { api } from '../lib/api.js'
import FormattedNumberInput from '../components/FormattedNumberInput.jsx'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export default function TransferMoney() {
  const navigate = useNavigate()

  const [wallets, setWallets] = React.useState([])
  const [fromId, setFromId] = React.useState('')
  const [toId, setToId] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [amountNum, setAmountNum] = React.useState(NaN)
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const walletsRes = await api.listWallets()
        const list = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []
        if (!mounted) return
        const all = Array.isArray(list) ? list : []
        const editable = all.filter((w) => {
          const p = w?.myPermission
          return p === 'owner' || p === 'edit'
        })
        setWallets(editable)

        const firstId = editable[0]?.id || editable[0]?._id || ''
        const secondId = editable[1]?.id || editable[1]?._id || firstId
        if (!fromId && firstId) setFromId(firstId)
        if (!toId && secondId) setToId(secondId)
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inputClass =
    'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

  const submit = (e) => {
    e.preventDefault()

    if (!fromId || !toId || fromId === toId) {
      setError('Please select two different wallets with edit permission')
      return
    }

    setError('')
    setBusy(true)
    ;(async () => {
      try {
        await api.transfer({
          fromWalletId: fromId,
          toWalletId: toId,
          amount: Math.abs(Number.isFinite(amountNum) ? amountNum : toNumber(amount)),
          date,
          note,
        })
        navigate('/transactions')
      } catch (e2) {
        setError(e2?.message || 'Failed to transfer')
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
            <h1 className="text-3xl font-black tracking-tight">Transfer Money</h1>
            <p className="mt-1 text-text-secondary">Move funds between wallets.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/transactions/add')}
            className="rounded-lg border border-border-dark bg-transparent px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
          >
            Back
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
          <div className="flex rounded-lg bg-border-dark p-1">
            <button
              type="button"
              onClick={() => navigate('/transactions/add')}
              className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-text-secondary hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
              Expense
            </button>
            <button
              type="button"
              onClick={() => navigate('/transactions/add')}
              className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-text-secondary hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Income
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-background-dark px-4 py-2 text-sm font-bold text-white"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Transfer
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 grid gap-4">
            {!wallets.length ? (
              <div className="rounded-xl border border-border-dark bg-surface-dark p-3 text-sm text-text-secondary">
                You need at least one wallet with edit permission.
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white">From</span>
                <select className={inputClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
                  {wallets.map((w) => (
                    <option key={w.id || w._id} value={w.id || w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white">To</span>
                <select className={inputClass} value={toId} onChange={(e) => setToId(e.target.value)}>
                  {wallets.map((w) => (
                    <option key={w.id || w._id} value={w.id || w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

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
              <span className="text-sm font-medium text-white">Date</span>
              <input className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Note</span>
              <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Transferring…' : 'Transfer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
