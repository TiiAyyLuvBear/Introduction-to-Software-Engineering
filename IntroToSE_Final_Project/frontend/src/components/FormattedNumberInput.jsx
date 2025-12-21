import React from 'react'

import { formatNumber, parseNumberLike } from '../lib/format.js'

export default function FormattedNumberInput({
  value,
  onChangeValue,
  placeholder,
  className,
  inputClassName,
  decimals = 0,
  min,
  required,
  disabled,
  name,
  id,
}) {
  const [focused, setFocused] = React.useState(false)
  const [text, setText] = React.useState('')

  React.useEffect(() => {
    if (focused) return
    if (value === '' || value === null || value === undefined) {
      setText('')
      return
    }
    setText(formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }))
  }, [value, decimals, focused])

  const emit = (nextText) => {
    setText(nextText)
    const n = parseNumberLike(nextText)
    onChangeValue?.(n, nextText)
  }

  return (
    <div className={className}>
      <input
        id={id}
        name={name}
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={inputClassName}
        value={text}
        onFocus={() => {
          setFocused(true)
          // remove grouping separators for easier editing
          setText((prev) => String(prev || '').replace(/,/g, ''))
        }}
        onBlur={() => {
          setFocused(false)
          const n = parseNumberLike(text)
          if (!Number.isFinite(n)) {
            setText('')
            return
          }
          const clamped = typeof min === 'number' ? Math.max(min, n) : n
          setText(formatNumber(clamped, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }))
          onChangeValue?.(clamped, String(clamped))
        }}
        onChange={(e) => {
          const raw = e.target.value
          // allow digits, comma (user paste), dot, minus
          const cleaned = raw.replace(/[^0-9,.-]/g, '')
          emit(cleaned)
        }}
      />
    </div>
  )
}
