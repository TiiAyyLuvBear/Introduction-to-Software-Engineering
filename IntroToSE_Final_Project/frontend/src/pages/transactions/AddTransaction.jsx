import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddTransactionForm from './components/AddTransactionForm.jsx'

export default function AddTransaction() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/transactions')
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <AddTransactionForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
