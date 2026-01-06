export function formatNumber(value, { maximumFractionDigits = 2, minimumFractionDigits = 0 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString(undefined, { maximumFractionDigits, minimumFractionDigits })
}

export function formatMoney(value, { currencySymbol = '$', maximumFractionDigits = 2, minimumFractionDigits = 2 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return `${currencySymbol}${formatNumber(0, { maximumFractionDigits, minimumFractionDigits })}`
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  return `${sign}${currencySymbol}${formatNumber(abs, { maximumFractionDigits, minimumFractionDigits })}`
}

export function parseNumberLike(value) {
  if (value === null || value === undefined) return NaN
  if (typeof value === 'number') return value
  const s = String(value)
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9.-]/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}
