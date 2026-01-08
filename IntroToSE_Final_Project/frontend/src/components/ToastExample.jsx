// Toast Usage Examples

import { useToast } from '../components/Toast.jsx'

function MyComponent() {
  const toast = useToast()

  // Success toast (green)
  const handleSuccess = () => {
    toast.success('Operation completed successfully!')
  }

  // Error toast (red)
  const handleError = () => {
    toast.error('Something went wrong!')
  }

  // Warning toast (yellow)
  const handleWarning = () => {
    toast.warning('Please check your input!')
  }

  // Info toast (blue)
  const handleInfo = () => {
    toast.info('Here is some information')
  }

  // Generic toast with custom type
  const handleCustom = () => {
    toast.addToast('Custom message', 'success')
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  )
}

// ========================================
// Replace alert() with toast
// ========================================

// Before:
// alert('Login successful!')

// After:
// toast.success('Login successful!')

// Before:
// alert('Error: ' + error.message)

// After:
// toast.error(error.message)

// ========================================
// Multiple toasts stack automatically
// ========================================

function handleMultiple() {
  const toast = useToast()
  
  toast.info('Processing...')
  setTimeout(() => toast.success('Step 1 completed'), 1000)
  setTimeout(() => toast.success('Step 2 completed'), 2000)
  setTimeout(() => toast.success('All done!'), 3000)
}
