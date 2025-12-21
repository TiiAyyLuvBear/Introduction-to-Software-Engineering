import React from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../lib/api.js'

const ICONS = [
  'restaurant',
  'directions_bus',
  'shopping_bag',
  'home',
  'movie',
  'health_and_safety',
  'fitness_center',
  'school',
  'pets',
  'payments',
  'work',
  'card_giftcard',
]

export default function AddCategory() {
  const navigate = useNavigate()

  const [type, setType] = React.useState('expense')
  const [name, setName] = React.useState('')
  const [parent, setParent] = React.useState('')
  const [icon, setIcon] = React.useState(ICONS[0])
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
        await api.createCategory({
          name: name.trim() || 'Untitled',
          type,
        })
        navigate('/categories')
      } catch (e2) {
        setError(e2?.message || 'Failed to create category')
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
            <h1 className="text-3xl font-black tracking-tight">New Category</h1>
            <p className="mt-1 text-text-secondary">Add an income or expense category.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/categories')}
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
          <div className="flex rounded-lg bg-border-dark p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={
                'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors ' +
                (type === 'expense' ? 'bg-background-dark text-white' : 'text-text-secondary hover:text-white')
              }
            >
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={
                'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors ' +
                (type === 'income' ? 'bg-background-dark text-white' : 'text-text-secondary hover:text-white')
              }
            >
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Income
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Category name</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Parent group (optional)</span>
              <input className={inputClass} value={parent} onChange={(e) => setParent(e.target.value)} placeholder="e.g. Living" />
            </label>

            <div className="grid gap-2">
              <div className="text-sm font-medium text-white">Icon</div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={
                      'flex h-12 items-center justify-center rounded-lg border transition-colors ' +
                      (icon === i
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-dark bg-surface-dark text-text-secondary hover:text-white')
                    }
                    aria-label={i}
                  >
                    <span className="material-symbols-outlined">{i}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
