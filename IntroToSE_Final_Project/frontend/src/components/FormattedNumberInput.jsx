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
  const [text, setText] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)

  // Chỉ sync từ prop value khi KHÔNG đang focus (không đang nhập)
  React.useEffect(() => {
    if (isFocused) return
    
    if (value === '' || value === null || value === undefined) {
      setText('')
      return
    }
    const numValue = Number(value)
    if (isNaN(numValue)) {
      setText('')
      return
    }
    setText(formatNumber(numValue, { minimumFractionDigits: 0, maximumFractionDigits: decimals }))
  }, [value, decimals, isFocused])

  const handleChange = (raw) => {
    // Chỉ cho phép số và dấu phẩy
    const cleaned = raw.replace(/[^0-9,]/g, '')
    
    if (!cleaned) {
      setText('')
      onChangeValue?.(NaN, '')
      return
    }
    
    // Tách phần nguyên và thập phân bằng dấu phẩy cuối cùng
    const lastCommaIndex = cleaned.lastIndexOf(',')
    let integerPart = ''
    let decimalPart = ''
    
    if (lastCommaIndex === -1) {
      integerPart = cleaned
    } else {
      integerPart = cleaned.slice(0, lastCommaIndex).replace(/,/g, '')
      decimalPart = cleaned.slice(lastCommaIndex + 1)
    }
    
    // Format phần nguyên với dấu chấm
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    // Ghép với phần thập phân
    let formatted = formattedInteger
    if (lastCommaIndex !== -1) {
      formatted += ',' + decimalPart
    }
    
    setText(formatted)
    
    // Parse thành số
    const numberString = integerPart + (decimalPart ? '.' + decimalPart : '')
    const n = Number(numberString)
    
    onChangeValue?.(Number.isFinite(n) ? n : NaN, formatted)
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
        onFocus={() => setIsFocused(true)}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          setIsFocused(false)
          const n = parseNumberLike(text)
          if (!Number.isFinite(n)) {
            setText('')
            return
          }
          const clamped = typeof min === 'number' ? Math.max(min, n) : n
          const formatted = formatNumber(clamped, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          setText(formatted)
          onChangeValue?.(clamped, formatted)
        }}
      />
    </div>
  )
}
