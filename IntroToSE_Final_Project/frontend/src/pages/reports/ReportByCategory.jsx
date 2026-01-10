import React from 'react'
import { Link } from 'react-router-dom'

import { formatMoney } from '../../lib/format.js'
import reportService from '../../services/reportService.js'
import transactionService from '../../services/transactionService.js'
import { listWallets } from '../../services/walletService.js'
import categoryService from '../../services/categoryService.js'

function toYmd(d) {
  return new Date(d).toISOString().slice(0, 10)
}

function safeNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function Bar({ pct, color, faded }) {
  const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0
  const style = color
    ? { width: `${width}%`, backgroundColor: color, opacity: faded ? 0.45 : 1 }
    : { width: `${width}%` }

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-background-dark">
      <div className={"h-full rounded-full " + (color ? '' : 'bg-primary')} style={style} />
    </div>
  )
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportByCategory() {
  const [selected, setSelected] = React.useState(null)
  const [rows, setRows] = React.useState([])
  const [tx, setTx] = React.useState([])
  const [walletNameById, setWalletNameById] = React.useState({})
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const [range, setRange] = React.useState('month')
  const [customStart, setCustomStart] = React.useState(toYmd(new Date()))
  const [customEnd, setCustomEnd] = React.useState(toYmd(new Date()))

  const rangeParams = React.useMemo(() => {
    const now = new Date()
    if (range === 'year') {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { startDate: start.toISOString(), endDate: end.toISOString(), label: 'This Year' }
    }
    if (range === 'custom') {
      const start = new Date(`${customStart}T00:00:00.000Z`)
      const end = new Date(`${customEnd}T23:59:59.999Z`)
      return { startDate: start.toISOString(), endDate: end.toISOString(), label: 'Custom Range' }
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return { startDate: start.toISOString(), endDate: end.toISOString(), label: 'This Month' }
  }, [range, customStart, customEnd])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setBusy(true)
        setError('')

        const [cats, expenseRows, incomeRows, txRes, walletsRes] = await Promise.all([
          categoryService.listCategories({ page: 1, limit: 200 }),
          reportService.getByCategory({ type: 'expense', startDate: rangeParams.startDate, endDate: rangeParams.endDate }),
          reportService.getByCategory({ type: 'income', startDate: rangeParams.startDate, endDate: rangeParams.endDate }),
          transactionService.getTransactions({
            startDate: rangeParams.startDate,
            endDate: rangeParams.endDate,
            limit: 200,
            sortBy: 'date',
            sortDir: 'desc',
          }),
          listWallets({ status: 'active' }),
        ])

        const colorByKey = {}
        if (Array.isArray(cats)) {
          for (const c of cats) {
            const id = c?._id || c?.id
            const color = c?.color
            if (id && color) colorByKey[String(id)] = color
            if (c?.name && color) colorByKey[`name:${String(c.name)}`] = color
          }
        }

        const expMap = {}
        if (Array.isArray(expenseRows)) {
          for (const r of expenseRows) {
            const name = r?.category || 'Uncategorized'
            const key = r?.categoryId ? String(r.categoryId) : `name:${name}`
            expMap[key] = { key, name, total: safeNumber(r?.total), count: safeNumber(r?.count) }
          }
        }

        const incMap = {}
        if (Array.isArray(incomeRows)) {
          for (const r of incomeRows) {
            const name = r?.category || 'Uncategorized'
            const key = r?.categoryId ? String(r.categoryId) : `name:${name}`
            incMap[key] = { key, name, total: safeNumber(r?.total), count: safeNumber(r?.count) }
          }
        }

        const keys = Array.from(new Set([...Object.keys(expMap), ...Object.keys(incMap)]))
        const merged = keys
          .map((k) => {
            const exp = expMap[k]
            const inc = incMap[k]
            const name = exp?.name || inc?.name || 'Uncategorized'
            return {
              key: k,
              name,
              color: colorByKey[k] || colorByKey[`name:${name}`] || null,
              expenseTotal: safeNumber(exp?.total),
              incomeTotal: safeNumber(inc?.total),
              expenseCount: safeNumber(exp?.count),
              incomeCount: safeNumber(inc?.count),
            }
          })
          .sort((a, b) => Math.max(b.expenseTotal, b.incomeTotal) - Math.max(a.expenseTotal, a.incomeTotal))

        const txListRaw = txRes?.data?.data ?? txRes?.data ?? []
        const txList = Array.isArray(txListRaw) ? txListRaw : []

        const map = {}
        if (Array.isArray(walletsRes)) {
          for (const w of walletsRes) {
            const id = w?.id || w?._id
            if (id) map[String(id)] = w?.name || 'Wallet'
          }
        }

        if (!mounted) return
        setRows(merged)
        setTx(txList)
        setWalletNameById(map)
      } catch (e2) {
        if (!mounted) return
        setError(e2?.message || 'Failed to load report')
        setRows([])
        setTx([])
      } finally {
        if (mounted) setBusy(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [rangeParams])

  const sumExpense = rows.reduce((s, r) => s + safeNumber(r.expenseTotal), 0)
  const sumIncome = rows.reduce((s, r) => s + safeNumber(r.incomeTotal), 0)
  const maxTotal = rows.reduce((m, r) => Math.max(m, safeNumber(r.expenseTotal), safeNumber(r.incomeTotal)), 0)

  const selectedRow = selected ? rows.find((r) => r.key === selected) : null
  const drill = selectedRow
    ? tx.filter((t) => {
        const catId = t?.categoryId ? String(t.categoryId) : ''
        if (selectedRow.key.startsWith('name:')) {
          return (t?.category || 'Uncategorized') === selectedRow.name
        }
        return catId === selectedRow.key
      })
    : []

  const exportCsv = () => {
    const header = 'category,expense_total,income_total\n'
    const body = rows
      .map((r) => {
        return `${JSON.stringify(r.name)},${safeNumber(r.expenseTotal).toFixed(2)},${safeNumber(r.incomeTotal).toFixed(2)}`
      })
      .join('\n')
    downloadText('report-by-category.csv', header + body + '\n')
  }

  const exportJson = () => {
    const data = {
      type: 'category',
      range: rangeParams,
      totals: { expense: sumExpense, income: sumIncome },
      rows,
      selected,
      drillDown: drill,
    }
    downloadText('report-by-category.json', JSON.stringify(data, null, 2))
  }

  const share = async () => {
    const payload = `Report by category (${rangeParams.label})\nExpense: ${formatMoney(sumExpense)}\nIncome: ${formatMoney(sumIncome)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Report by category', text: payload })
        return
      }
    } catch {
      // ignore
    }
    try {
      await navigator.clipboard.writeText(payload)
      alert('Copied report summary to clipboard')
    } catch {
      alert(payload)
    }
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2">
              <Link
                to="/reports"
                className="inline-flex items-center gap-1 rounded-lg border border-border-dark bg-transparent px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Back to Reports
              </Link>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Report by Category</h1>
            <p className="mt-1 text-text-secondary">Income & expenses by category{error ? ` • ${error}` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="h-10 rounded-lg border border-border-dark bg-border-dark/30 px-4 text-sm font-semibold text-white hover:bg-border-dark/50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="h-10 rounded-lg border border-border-dark bg-border-dark/30 px-4 text-sm font-semibold text-white hover:bg-border-dark/50"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={share}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110"
            >
              Share
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-border-dark p-1">
            <button
              className={
                'px-3 py-1 text-xs font-bold ' +
                (range === 'month' ? 'rounded-md bg-primary text-background-dark' : 'text-text-secondary')
              }
              type="button"
              onClick={() => setRange('month')}
            >
              Month
            </button>
            <button
              className={
                'px-3 py-1 text-xs font-bold ' +
                (range === 'year' ? 'rounded-md bg-primary text-background-dark' : 'text-text-secondary')
              }
              type="button"
              onClick={() => setRange('year')}
            >
              Year
            </button>
            <button
              className={
                'px-3 py-1 text-xs font-bold ' +
                (range === 'custom' ? 'rounded-md bg-primary text-background-dark' : 'text-text-secondary')
              }
              type="button"
              onClick={() => setRange('custom')}
            >
              Range
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary/20 px-2 py-1 text-xs font-bold text-primary">{rangeParams.label}</span>
            {busy ? <span className="text-xs text-text-secondary">Loading…</span> : null}
          </div>
        </div>

        {range === 'custom' ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-10 rounded-lg border border-border-dark bg-border-dark/30 px-3 text-sm text-white outline-none"
            />
            <span className="text-xs text-text-secondary">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-10 rounded-lg border border-border-dark bg-border-dark/30 px-3 text-sm text-white outline-none"
            />
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-text-secondary">Bar plot by category</div>
              <div className="mt-1 text-xs text-text-secondary">Expense + income totals ({rangeParams.label})</div>
            </div>
            <div className="text-xs text-text-secondary">
              Expense: <span className="font-semibold text-white">{formatMoney(sumExpense)}</span> • Income:{' '}
              <span className="font-semibold text-white">{formatMoney(sumIncome)}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {rows.slice(0, 12).map((r) => {
              const expensePct = maxTotal ? (safeNumber(r.expenseTotal) / maxTotal) * 100 : 0
              const incomePct = maxTotal ? (safeNumber(r.incomeTotal) / maxTotal) * 100 : 0
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setSelected(selected === r.key ? null : r.key)}
                  className={
                    'w-full rounded-xl border border-border-dark bg-border-dark/20 p-4 text-left hover:bg-border-dark/35 transition-colors ' +
                    (selected === r.key ? 'ring-1 ring-primary' : '')
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-xs text-text-secondary">
                      -{formatMoney(safeNumber(r.expenseTotal))} • +{formatMoney(safeNumber(r.incomeTotal))}
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2">
                    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                      <div className="text-[11px] font-semibold text-text-secondary">Expense</div>
                      <Bar pct={expensePct} color={r.color} faded={false} />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                      <div className="text-[11px] font-semibold text-text-secondary">Income</div>
                      <Bar pct={incomePct} color={r.color} faded={true} />
                    </div>
                  </div>
                </button>
              )
            })}

            {rows.length === 0 ? (
              <div className="rounded-xl border border-border-dark bg-border-dark/20 p-5 text-sm text-text-secondary">
                No data yet for this range.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border-dark bg-card-dark">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-dark text-text-secondary">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Expense</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {rows.map((r) => {
                const isSel = selected === r.key
                return (
                  <tr
                    key={r.key}
                    className={
                      'cursor-pointer transition-colors hover:bg-border-dark/40 ' +
                      (isSel ? 'bg-border-dark/30' : '')
                    }
                    onClick={() => setSelected(isSel ? null : r.key)}
                  >
                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">-{formatMoney(safeNumber(r.expenseTotal))}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">+{formatMoney(safeNumber(r.incomeTotal))}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-text-secondary" colSpan={3}>
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border-dark bg-card-dark">
            <div className="border-b border-border-dark px-5 py-4">
              <div className="text-sm font-bold text-white">Transactions in {selectedRow?.name}</div>
              <div className="text-xs text-text-secondary">Click the category row again to close.</div>
            </div>
            <ul className="divide-y divide-border-dark">
              {drill.map((t) => (
                <li key={t._id || t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{t.note || '—'}</div>
                    <div className="text-xs text-text-secondary">
                      {String(t.date).slice(0, 10)} • {walletNameById[String(t.walletId)] || 'Wallet'}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {(t.type === 'expense' ? '-' : '+') + formatMoney(Math.abs(Number(t.amount)))}
                  </div>
                </li>
              ))}
              {drill.length === 0 && (
                <li className="px-5 py-6 text-center text-sm text-text-secondary">No items.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
