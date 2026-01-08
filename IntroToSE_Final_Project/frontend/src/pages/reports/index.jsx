import React from 'react'
import { Link } from 'react-router-dom'

// import { api } from '../../lib/api.js'
import { formatMoney } from '../../lib/format.js'

function toYmd(d) {
  return new Date(d).toISOString().slice(0, 10)
}

function LineChart({ rows, valueKey, colorClass, range }) {
  const chart = React.useMemo(() => {
    const safe = Array.isArray(rows) ? rows : []
    const height = 160
    const width = 640

    if (!safe.length) {
      return { viewBox: `0 0 ${width} ${height}`, path: '', points: [], labels: [] }
    }

    const padX = 16
    const padY = 16
    const chartW = width - padX * 2
    const chartH = height - padY * 2

    const maxVal = Math.max(1, ...safe.map((r) => Number(r?.[valueKey] || 0)))
    const n = safe.length
    const stepX = n <= 1 ? 0 : chartW / (n - 1)
    const yBase = padY + chartH

    const points = safe.map((r, i) => {
      const v = Number(r?.[valueKey] || 0)
      const x = padX + i * stepX
      const y = yBase - (v / maxVal) * chartH
      return { key: `${r.period}-${valueKey}`, x, y }
    })

    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ')

    const labelEvery = range === 'year' ? 1 : Math.ceil(safe.length / 6)
    const labels = safe
      .map((r, i) => ({ period: String(r.period || ''), i }))
      .filter((x) => x.i % labelEvery === 0)
      .map((x) => {
        const x0 = padX + x.i * stepX
        const text = range === 'year' ? x.period.slice(5) : x.period.slice(8)
        return { key: `${x.period}-${valueKey}-lbl`, x: x0, text }
      })

    return { viewBox: `0 0 ${width} ${height}`, path, points, labels }
  }, [rows, valueKey, range])

  return (
    <div className="h-44 rounded-xl border border-border-dark bg-border-dark/20 p-3">
      {Array.isArray(rows) && rows.length ? (
        <svg className="h-full w-full" viewBox={chart.viewBox} preserveAspectRatio="none" role="img">
          <line x1="0" y1="159" x2="640" y2="159" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <path d={chart.path} className={`fill-none stroke-current ${colorClass}`} strokeWidth="2.5" />
          {chart.points.map((p) => (
            <circle key={p.key} cx={p.x} cy={p.y} r="2.5" className={`fill-current ${colorClass}`} />
          ))}
          {chart.labels.map((l) => (
            <text key={l.key} x={l.x} y="156" fontSize="10" fill="rgba(255,255,255,0.45)">
              {l.text}
            </text>
          ))}
        </svg>
      ) : (
        <div className="h-full flex items-center justify-center text-sm text-text-secondary">No data yet</div>
      )}
    </div>
  )
}

export default function Reports() {
  const [range, setRange] = React.useState('month')
  const [customStart, setCustomStart] = React.useState(toYmd(new Date()))
  const [customEnd, setCustomEnd] = React.useState(toYmd(new Date()))

  const [expenseTotal, setExpenseTotal] = React.useState(0)
  const [incomeTotal, setIncomeTotal] = React.useState(0)
  const [topCategory, setTopCategory] = React.useState(null)
  const [chartRows, setChartRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const rangeParams = React.useMemo(() => {
    const now = new Date()
    if (range === 'year') {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { interval: 'month', startDate: start.toISOString(), endDate: end.toISOString(), label: 'This Year' }
    }
    if (range === 'custom') {
      const start = new Date(`${customStart}T00:00:00.000Z`)
      const end = new Date(`${customEnd}T23:59:59.999Z`)
      return { interval: 'day', startDate: start.toISOString(), endDate: end.toISOString(), label: 'Custom Range' }
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return { interval: 'day', startDate: start.toISOString(), endDate: end.toISOString(), label: 'This Month' }
  }, [range, customStart, customEnd])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      setBusy(true)
      setError('')
      try {
        const [summaryRes, byCatRes, barRes] = await Promise.all([
          api.reportSummary({ startDate: rangeParams.startDate, endDate: rangeParams.endDate }),
          api.reportByCategory({ startDate: rangeParams.startDate, endDate: rangeParams.endDate, type: 'expense' }),
          api.reportBarChart({
            startDate: rangeParams.startDate,
            endDate: rangeParams.endDate,
            interval: rangeParams.interval,
          }),
        ])

        const expense = summaryRes?.data?.expense ?? 0
        const income = summaryRes?.data?.income ?? 0
        const rows = byCatRes?.data || []
        const top = Array.isArray(rows) && rows.length
          ? { name: rows[0]?.category || 'Uncategorized', total: Number(rows[0]?.total || 0) }
          : null

        const fetched = barRes?.data || barRes || []

        if (!mounted) return
        setExpenseTotal(Number(expense) || 0)
        setIncomeTotal(Number(income) || 0)
        setTopCategory(top)
        setChartRows(Array.isArray(fetched) ? fetched : [])
      } catch (e2) {
        if (!mounted) return
        setError(e2?.message || 'Failed to load reports')
        setChartRows([])
      } finally {
        if (mounted) setBusy(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [rangeParams])

  const topPct = expenseTotal && topCategory ? (topCategory.total / expenseTotal) * 100 : 0
  const donutStyle = {
    background: `conic-gradient(#19e65e 0 ${topPct}%, #29382e ${topPct}% 100%)`,
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Reports</h1>
          <p className="text-text-secondary">Analyze your spending and track progress.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-lg font-bold text-white">Spending overview</div>
                <div className="mt-1 text-sm text-text-secondary">Expenses breakdown from your transactions</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/20 px-2 py-1 text-xs font-bold text-primary">{rangeParams.label}</span>
                {error ? <span className="text-xs text-red-200">{error}</span> : null}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

              {range === 'custom' ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
              <div className="flex items-center gap-5">
                <div className="relative size-32 rounded-full" style={donutStyle}>
                  <div className="absolute inset-4 rounded-full bg-card-dark" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Total expenses</div>
                  <div className="mt-1 text-2xl font-bold text-white">{formatMoney(expenseTotal)}</div>
                  <div className="mt-2 text-sm text-text-secondary">
                    Total income: <span className="font-semibold text-white">{formatMoney(incomeTotal)}</span>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    Top category:{' '}
                    <span className="font-semibold text-white">{topCategory?.name || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  to="/reports/category"
                  className="rounded-xl border border-border-dark bg-border-dark/30 p-5 hover:bg-border-dark/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-[20px]">pie_chart</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-white">By Category</div>
                        <div className="text-sm text-text-secondary">Totals + % + drill-down</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                  </div>
                </Link>

                <Link
                  to="/reports/wallet"
                  className="rounded-xl border border-border-dark bg-border-dark/30 p-5 hover:bg-border-dark/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-white">By Wallet</div>
                        <div className="text-sm text-text-secondary">Totals + % + drill-down</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border-dark bg-card-dark p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Income trend</div>
                    <div className="mt-1 text-xs text-text-secondary">{rangeParams.label}</div>
                  </div>
                  {busy ? <div className="text-xs text-text-secondary">Loading…</div> : null}
                </div>
                <div className="mt-3">
                  <LineChart rows={chartRows} valueKey="income" colorClass="text-primary" range={range} />
                </div>
              </div>

              <div className="rounded-xl border border-border-dark bg-card-dark p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Expense trend</div>
                    <div className="mt-1 text-xs text-text-secondary">{rangeParams.label}</div>
                  </div>
                  {busy ? <div className="text-xs text-text-secondary">Loading…</div> : null}
                </div>
                <div className="mt-3">
                  <LineChart rows={chartRows} valueKey="expense" colorClass="text-red-400" range={range} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="text-lg font-bold text-white">Quick actions</div>
            <div className="mt-1 text-sm text-text-secondary">Jump into common reports</div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/reports/category"
                className="flex items-center justify-between rounded-xl border border-border-dark bg-border-dark/30 px-4 py-3 hover:bg-border-dark/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">category</span>
                  <span className="font-semibold text-white">Report by Category</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
              </Link>
              <Link
                to="/reports/wallet"
                className="flex items-center justify-between rounded-xl border border-border-dark bg-border-dark/30 px-4 py-3 hover:bg-border-dark/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">wallet</span>
                  <span className="font-semibold text-white">Report by Wallet</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
