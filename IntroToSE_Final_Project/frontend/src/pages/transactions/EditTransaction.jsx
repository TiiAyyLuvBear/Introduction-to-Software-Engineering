import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditTransactionForm from './components/EditTransactionForm.jsx'

export default function EditTransaction() {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleSuccess = () => {
    navigate('/transactions')
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  // Note: You might need to fetch the transaction data here
  // For now, passing null and let the form handle it
  return (
    <div className="px-4 py-6 md:px-10">
      <EditTransactionForm 
        transaction={null} 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </div>
  )
}
