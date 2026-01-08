import React from 'react'
import { useNavigate } from 'react-router-dom'

import * as walletService from '../../services/walletService.js'
import FormattedNumberInput from '../../components/FormattedNumberInput.jsx'

// Icon list with labels for tooltips
const ICONS = [
  { id: 'account_balance_wallet', label: 'Wallet' },
  { id: 'payments', label: 'Payments' },
  { id: 'account_balance', label: 'Bank' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'savings', label: 'Savings' },
  { id: 'paid', label: 'Paid' },
]

// Currency options
const CURRENCIES = [
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'USD', name: 'US Dollar' },
]

export default function CreateWallet() {
  const navigate = useNavigate()

  const [icon, setIcon] = React.useState(ICONS[0].id)
  const [name, setName] = React.useState('')
  const [currency, setCurrency] = React.useState('VND')
  const [currency, setCurrency] = React.useState('VND')
  const [balance, setBalance] = React.useState('0')
  const [balanceNum, setBalanceNum] = React.useState(0)
  const [type, setType] = React.useState('Cash')
  const [include, setInclude] = React.useState(true)
  const [isShared, setIsShared] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const inputClass =
    'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

  const selectClass =
    'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer'

  const submit = (e) => {
    e.preventDefault()

    setError('')
    setBusy(true)
      ; (async () => {
        try {
          await walletService.createWallet({
            name: name.trim() || 'Untitled',
            type,
            initialBalance: Number.isFinite(balanceNum) ? balanceNum : Number(balance) || 0,
            currency,
            isShared,
          })
          navigate('/wallets')
        } catch (e2) {
          setError(e2?.response?.data?.error || e2?.message || 'Failed to create wallet')
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
            <h1 className="text-3xl font-black tracking-tight">Add New Wallet</h1>
            <p className="mt-1 text-text-secondary">Create a wallet for cash, bank, or cards.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/wallets')}
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
            <div className="grid gap-2">
              <div className="text-sm font-medium text-white">Icon</div>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    title={i.label}
                    onClick={() => setIcon(i.id)}
                    className={
                      'flex h-12 items-center justify-center rounded-lg border transition-colors ' +
                      (icon === i.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-dark bg-surface-dark text-text-secondary hover:text-white')
                    }
                  >
                    <span className="material-symbols-outlined">{i.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Name</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white">Currency</span>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                    expand_more
                  </span>
                </div>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white">Starting balance</span>
                <FormattedNumberInput
                  inputClassName={inputClass}
                  value={balanceNum}
                  decimals={2}
                  onChangeValue={(n, raw) => {
                    setBalanceNum(n)
                    setBalance(raw)
                  }}
                />
              </label>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium text-white">Wallet type</div>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { v: 'Cash', label: 'Cash' },
                  { v: 'Bank', label: 'Bank' },
                  { v: 'Savings', label: 'Savings' },
                ].map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => setType(t.v)}
                    className={
                      'h-12 rounded-lg border text-sm font-bold transition-colors ' +
                      (type === t.v
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-dark bg-surface-dark text-text-secondary hover:text-white')
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-lg border border-border-dark bg-surface-dark px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">Include in total</div>
                <div className="text-xs text-text-secondary">Show this wallet in net worth summaries.</div>
              </div>
              <input
                type="checkbox"
                checked={include}
                onChange={(e) => setInclude(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-lg border border-border-dark bg-surface-dark px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">Shared wallet</div>
                <div className="text-xs text-text-secondary">Invite members and manage permissions.</div>
              </div>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create wallet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
