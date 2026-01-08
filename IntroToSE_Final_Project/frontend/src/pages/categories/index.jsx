import React from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../../services/api.js'
import MoreMenu from '../../components/MoreMenu.jsx'

export default function Categories() {
  const navigate = useNavigate()

  const [all, setAll] = React.useState([])
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.listCategories({ page: 1, limit: 200 })
        const items = res?.items || []
        if (!mounted) return
        setAll(Array.isArray(items) ? items : [])
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const [type, setType] = React.useState('expense')
  const [query, setQuery] = React.useState('')
  const items = all
    .filter((c) => c.type === type)
    .filter((c) => (query ? c.name.toLowerCase().includes(query.toLowerCase()) : true))

  const deleteCategory = async (category) => {
    const id = category?._id || category?.id
    if (!id) return
    if (category?.isDefault) {
      setError('Default categories cannot be deleted')
      return
    }
    if (!window.confirm('Delete this category?')) return
    setBusyId(id)
    setError('')
    try {
      await api.deleteCategory(id)
      setAll((prev) => prev.filter((c) => (c._id || c.id) !== id))
    } catch (e) {
      setError(e?.message || 'Failed to delete category')
    } finally {
      setBusyId(null)
    }
  }

  const renameCategory = async (category) => {
    const id = category?._id || category?.id
    if (!id) return
    if (category?.isDefault) {
      setError('Default categories cannot be edited')
      return
    }

    const currentName = String(category?.name || '').trim()
    const nextName = window.prompt('Rename category', currentName)
    if (nextName === null) return
    const trimmed = String(nextName).trim()
    if (!trimmed || trimmed === currentName) return

    setBusyId(id)
    setError('')
    try {
      const updated = await api.updateCategory(id, { name: trimmed })
      setAll((prev) => prev.map((c) => ((c._id || c.id) === id ? { ...c, ...(updated || {}) } : c)))
    } catch (e) {
      setError(e?.message || 'Failed to rename category')
    } finally {
      setBusyId(null)
    }
  }

  const cardClass =
    'rounded-xl border border-border-dark bg-card-dark p-5 transition-all hover:border-primary/50'

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Manage Categories</h1>
            <p className="text-text-secondary">Organize your income and expenses efficiently.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/categories/new')}
            className="hidden h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-background-dark hover:brightness-110 md:inline-flex"
          >
            <span className="material-symbols-outlined">add</span>
            New Category
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-sm rounded-lg bg-border-dark p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={
                'flex-1 rounded-md px-4 py-2 text-sm font-bold transition-colors ' +
                (type === 'expense' ? 'bg-background-dark text-white' : 'text-text-secondary hover:text-white')
              }
            >
              <span className="material-symbols-outlined mr-2 align-middle text-[18px]">trending_down</span>
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={
                'flex-1 rounded-md px-4 py-2 text-sm font-bold transition-colors ' +
                (type === 'income' ? 'bg-background-dark text-white' : 'text-text-secondary hover:text-white')
              }
            >
              <span className="material-symbols-outlined mr-2 align-middle text-[18px]">trending_up</span>
              Income
            </button>
          </div>

          <label className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              className="h-12 w-full rounded-lg bg-surface-dark border border-input-border pl-10 pr-4 text-white placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
          {error ? (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => navigate('/categories/new')}
            className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-dark hover:border-primary hover:bg-primary/5 transition-all md:hidden"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <div className="text-sm font-bold text-text-secondary">Create New</div>
          </button>

          {items.map((c) => (
            <div key={c._id} className={cardClass}>
              <div className="flex items-start justify-end">
                <MoreMenu
                  ariaLabel="Category options"
                  buttonClassName="rounded-full p-1 text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                  items={[
                    {
                      label: 'Rename',
                      icon: 'edit',
                      disabled: Boolean(c?.isDefault) || busyId === (c._id || c.id),
                      onClick: () => renameCategory(c),
                    },
                    {
                      label: 'Delete',
                      icon: 'delete',
                      disabled: Boolean(c?.isDefault) || busyId === (c._id || c.id),
                      onClick: () => deleteCategory(c),
                    },
                  ]}
                />
              </div>
              <div className="mt-4">
                <div className="text-lg font-bold text-white">{c.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-background-dark overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-primary" />
                  </div>
                  <div className="text-xs font-medium text-text-secondary">—</div>
                </div>
                <div className="mt-2 text-xs text-text-secondary">Category</div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full rounded-xl border border-border-dark bg-card-dark p-6 text-text-secondary">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
