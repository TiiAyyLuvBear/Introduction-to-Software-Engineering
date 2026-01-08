import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    const toast = { id, message, type }
    
    setToasts((prev) => [...prev, toast])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2000)
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, 'success'), [addToast])
  const error = useCallback((message) => addToast(message, 'error'), [addToast])
  const info = useCallback((message) => addToast(message, 'info'), [addToast])
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast
  
  const typeStyles = {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    warning: 'bg-yellow-500/90 text-white',
    info: 'bg-blue-500/90 text-white'
  }


  return (
    <div
      className={`
        ${typeStyles[type]}
        min-w-[300px] max-w-md
        px-4 py-3 rounded-lg shadow-lg
        flex items-center gap-3
        animate-slide-in-right
        pointer-events-auto
        backdrop-blur-sm
      `}
      role="alert"
    >
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <span className="text-lg">×</span>
      </button>
    </div>
  )
}
