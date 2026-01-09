import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api.js'

export default function AcceptInvitation() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = React.useState('pending')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Invalid invitation link.')
      return
    }
    ;(async () => {
      try {
        // 1. Lấy thông tin invitation từ token
        const res = await api.get(`/invitations/by-token/${token}`)
        const invitation = res?.data?.data?.invitation || res?.data?.invitation
        if (!invitation) throw new Error('Invitation not found')
        if (invitation.status !== 'pending') throw new Error('Invitation is no longer valid')
        // 2. Gửi accept
        await api.post(`/invitations/${invitation._id}/respond`, { response: 'accept' })
        setStatus('accepted')
        setTimeout(() => navigate('/wallets'), 2000)
      } catch (e) {
        setStatus('error')
        setError(e?.response?.data?.error || e?.message || 'Failed to accept invitation')
      }
    })()
  }, [token, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <div className="rounded-xl border border-border-dark bg-card-dark p-8 max-w-md w-full text-center">
        {status === 'pending' && <div className="text-white">Processing invitation...</div>}
        {status === 'accepted' && <div className="text-green-400 font-bold text-xl">Invitation accepted! Redirecting...</div>}
        {status === 'error' && <div className="text-red-400 font-bold">{error}</div>}
      </div>
    </div>
  )
}
