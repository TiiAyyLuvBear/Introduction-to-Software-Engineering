import React from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../lib/api.js'
import FormattedNumberInput from '../components/FormattedNumberInput.jsx'

export default function CreateGoal() {
  const navigate = useNavigate()

  const [name, setName] = React.useState('')
  const [targetAmount, setTargetAmount] = React.useState('')
  const [targetAmountNum, setTargetAmountNum] = React.useState(NaN)
  const [targetDate, setTargetDate] = React.useState('')
  const [icon, setIcon] = React.useState('flag')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const inputClass =
    'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

  const submit = (e) => {
    e.preventDefault()

    setError('')
    setBusy(true)
    ;(async () => {
      try {
        await api.createGoal({
          name: name.trim() || 'Untitled Goal',
          targetAmount: Number.isFinite(targetAmountNum) ? targetAmountNum : Number(targetAmount) || 0,
          currentAmount: 0,
          deadline: targetDate || null,
          icon,
        })
        navigate('/savings')
      } catch (e2) {
        setError(e2?.message || 'Failed to create goal')
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
            <h1 className="text-3xl font-black tracking-tight">Create New Goal</h1>
            <p className="mt-1 text-text-secondary">Set a target and track progress.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/savings')}
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
              <span className="text-sm font-medium text-white">Goal name</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Target amount</span>
              <FormattedNumberInput
                inputClassName={inputClass}
                value={targetAmount}
                decimals={2}
                placeholder="0.00"
                required
                min={0}
                onChangeValue={(n, raw) => {
                  setTargetAmount(raw)
                  setTargetAmountNum(n)
                }}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Target date (optional)</span>
              <input className={inputClass} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} type="date" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Icon</span>
              <select className={inputClass} value={icon} onChange={(e) => setIcon(e.target.value)}>
                {['flag', 'health_and_safety', 'flight', 'laptop_mac', 'home', 'directions_car'].map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create goal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
