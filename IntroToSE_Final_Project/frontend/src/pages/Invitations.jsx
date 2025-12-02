import React, { useState, useEffect } from 'react'
import { invitationAPI } from '../api.js'

/**
 * Invitations Component - Handle Use Case U011 Response Phase
 * 
 * Features:
 * - Display pending invitations
 * - Accept/Decline invitations  
 * - Real-time invitation status updates
 */

export default function Invitations() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState({})

  useEffect(() => {
    loadPendingInvitations()
  }, [])

  const loadPendingInvitations = async () => {
    try {
      setLoading(true)
      const response = await invitationAPI.getPending()
      if (response.success) {
        setInvitations(response.data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to load invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use Case U011: Accept/Decline Invitation (Response Phase step 11)
  const handleInvitationResponse = async (invitationId, response, walletName) => {
    const action = response === 'accept' ? 'accepting' : 'declining'
    
    if (!window.confirm(`Are you sure you want to ${response} the invitation to join "${walletName}"?`)) {
      return
    }
    
    try {
      setResponding(prev => ({ ...prev, [invitationId]: action }))
      
      const apiResponse = await invitationAPI.respond(invitationId, response)
      
      if (apiResponse.success) {
        // Remove invitation from list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
        
        // Show success message
        if (response === 'accept') {
          alert(`Successfully joined "${walletName}"! You can now view and manage this wallet.`)
        } else {
          alert(`Invitation to "${walletName}" declined.`)
        }
      }
    } catch (error) {
      console.error(`Failed to ${response} invitation:`, error)
      
      // Handle specific errors
      if (error.response?.status === 403) {
        alert('Only invited user can respond to invitation')
      } else if (error.response?.data?.message?.includes('expired')) {
        alert('This invitation has expired')
        // Remove expired invitation from list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      } else {
        alert(error.response?.data?.error || `Failed to ${response} invitation`)
      }
    } finally {
      setResponding(prev => ({ ...prev, [invitationId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invitations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Wallet Invitations</h2>
        <p className="text-gray-600">
          You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {invitations.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No pending invitations</h3>
          <p className="text-gray-600">You're all caught up! New wallet invitations will appear here.</p>
        </div>
      ) : (
        // Invitations List
        <div className="space-y-4">
          {invitations.map(invitation => {
            const isExpiringSoon = new Date(invitation.expiresAt) - new Date() < 24 * 60 * 60 * 1000 // Less than 24h
            const isResponding = responding[invitation.id]
            
            return (
              <div 
                key={invitation.id} 
                className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${
                  isExpiringSoon ? 'border-l-orange-400' : 'border-l-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Invitation Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">
                        {invitation.wallet.type === 'Cash' ? '💵' : 
                         invitation.wallet.type === 'Bank' ? '🏦' : '🐷'}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {invitation.wallet.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {invitation.wallet.type} Wallet
                        </p>
                      </div>
                      {isExpiringSoon && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          Expires Soon
                        </span>
                      )}
                    </div>

                    {/* Invitation Details */}
                    <div className="mb-4">
                      <p className="text-gray-700 mb-2">
                        <strong>{invitation.inviter.name}</strong> has invited you to join their shared wallet.
                      </p>
                      
                      {invitation.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        <p>From: {invitation.inviter.email}</p>
                        <p>Invited: {new Date(invitation.invitedAt).toLocaleDateString()}</p>
                        <p>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    {/* Step 11: User chooses Accept or Decline */}
                    <button
                      onClick={() => handleInvitationResponse(invitation.id, 'accept', invitation.wallet.name)}
                      disabled={isResponding}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isResponding === 'accepting'
                          ? 'bg-green-300 text-green-800'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isResponding === 'accepting' ? 'Accepting...' : '✓ Accept'}
                    </button>
                    
                    <button
                      onClick={() => handleInvitationResponse(invitation.id, 'decline', invitation.wallet.name)}
                      disabled={isResponding}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isResponding === 'declining'
                          ? 'bg-red-300 text-red-800'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isResponding === 'declining' ? 'Declining...' : '✕ Decline'}
                    </button>
                  </div>
                </div>

                {/* Progress Indicator */}
                {isResponding && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>Processing your response...</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={loadPendingInvitations}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Invitations'}
        </button>
      </div>
    </div>
  )
}