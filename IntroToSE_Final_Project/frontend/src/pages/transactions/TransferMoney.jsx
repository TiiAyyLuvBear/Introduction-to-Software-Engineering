import React from 'react'
import { useNavigate } from 'react-router-dom'
import TransferMoneyForm from './components/TransferMoneyForm.jsx'

export default function TransferMoney() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/transactions')
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  const handleSwitchToTransaction = () => {
    navigate('/transactions/add')
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <TransferMoneyForm 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
        onSwitchToTransaction={handleSwitchToTransaction}
      />
    </div>
  )
}
