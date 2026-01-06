import React from 'react'

export default function MoreMenu({
  items,
  buttonClassName = 'text-text-secondary hover:text-white',
  menuClassName = '',
  align = 'right',
  ariaLabel = 'More options',
}) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)

  const close = React.useCallback(() => setOpen(false), [])

  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (e) => {
      const root = rootRef.current
      if (!root) return
      if (!root.contains(e.target)) close()
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const side = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={buttonClassName}
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      {open ? (
        <div
          role="menu"
          className={
            `absolute z-50 mt-2 min-w-[160px] overflow-hidden rounded-lg border border-border-dark bg-card-dark shadow-sm ${side} ` +
            menuClassName
          }
          onClick={(e) => {
            // Keep menu clicks from bubbling to card click handlers.
            e.stopPropagation()
          }}
        >
          {(items || []).map((it, idx) => {
            const disabled = Boolean(it?.disabled)
            return (
              <button
                key={idx}
                type="button"
                role="menuitem"
                disabled={disabled}
                className={
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm ' +
                  (disabled
                    ? 'cursor-not-allowed text-text-secondary/60'
                    : 'text-white hover:bg-border-dark')
                }
                onClick={async () => {
                  if (disabled) return
                  close()
                  await it?.onClick?.()
                }}
              >
                {it?.icon ? (
                  <span className="material-symbols-outlined text-[18px] text-text-secondary">{it.icon}</span>
                ) : null}
                <span>{it?.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
