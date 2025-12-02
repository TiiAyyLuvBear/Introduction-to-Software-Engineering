import React, { useState, useEffect } from 'react'
import { walletAPI, invitationAPI } from '../api.js'

/**
 * SharedWallet Component - Implement Use Cases U011-U014
 * 
 * Features:
 * U011 - Invite Member to Wallet
 * U012 - Leave Shared Wallet  
 * U013 - Remove Member
 * U014 - Set Member Permission
 */

export default function SharedWallet({ walletId, isOwner, onClose }) {
  const [wallet, setWallet] = useState(null)
  const [members, setMembers] = useState([])
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  
  // Invite member state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', message: '' })
  const [inviteErrors, setInviteErrors] = useState({})
  const [inviting, setInviting] = useState(false)
  
  // Transfer ownership state
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedNewOwner, setSelectedNewOwner] = useState('')
  
  const [pendingInvitations, setPendingInvitations] = useState([])

  useEffect(() => {
    if (walletId) {
      loadWalletMembers()
    }
  }, [walletId])

  const loadWalletMembers = async () => {
    try {
      setLoading(true)
      const response = await walletAPI.getWalletMembers(walletId)
      if (response.success) {
        setOwner(response.data.owner)
        setMembers(response.data.members)
      }
    } catch (error) {
      console.error('Failed to load wallet members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use Case U011: Invite Member
  const handleInviteMember = async (e) => {
    e.preventDefault()
    
    if (!inviteForm.email.trim()) {
      setInviteErrors({ email: 'Email is required' })
      return
    }
    
    setInviting(true)
    setInviteErrors({})
    
    try {
      const startTime = Date.now()
      const response = await walletAPI.inviteMember(
        walletId, 
        inviteForm.email.trim(), 
        inviteForm.message.trim()
      )
      
      if (response.success) {
        const endTime = Date.now()
        console.log(`Invitation sent in ${endTime - startTime}ms`)
        
        setInviteForm({ email: '', message: '' })
        setShowInviteModal(false)
        
        // Show success message
        alert('Invitation sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        setInviteErrors({ email: 'User not found' })
      } else if (error.response?.data?.code === 'ALREADY_MEMBER') {
        setInviteErrors({ email: 'User already a member' })
      } else if (error.response?.data?.code === 'ALREADY_INVITED') {
        setInviteErrors({ email: 'User already invited' })
      } else {
        setInviteErrors({ submit: error.response?.data?.error || 'Failed to send invitation' })
      }
    } finally {
      setInviting(false)
    }
  }

  // Use Case U012: Leave Wallet
  const handleLeaveWallet = async () => {
    if (!window.confirm('Are you sure you want to leave this wallet? You will no longer have access to its data and transactions.')) {
      return
    }
    
    try {
      const response = await walletAPI.leaveWallet(walletId)
      if (response.success) {
        alert('Successfully left the wallet')
        onClose()
      }
    } catch (error) {
      console.error('Failed to leave wallet:', error)
      
      if (error.response?.data?.code === 'OWNER_CANNOT_LEAVE') {
        // Show transfer ownership dialog
        setShowTransferModal(true)
      } else {
        alert(error.response?.data?.error || 'Failed to leave wallet')
      }
    }
  }

  // Use Case U012: Transfer Ownership
  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      alert('Please select a new owner')
      return
    }
    
    if (!window.confirm('Are you sure you want to transfer ownership? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await walletAPI.transferOwnership(walletId, selectedNewOwner)
      if (response.success) {
        alert('Ownership transferred successfully')
        setShowTransferModal(false)
        loadWalletMembers() // Reload to reflect changes
      }
    } catch (error) {
      console.error('Failed to transfer ownership:', error)
      alert(error.response?.data?.error || 'Failed to transfer ownership')
    }
  }

  // Use Case U013: Remove Member
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this wallet?`)) {
      return
    }
    
    try {
      const response = await walletAPI.removeMember(walletId, memberId)
      if (response.success) {
        alert('Member removed successfully')
        loadWalletMembers() // Reload members list
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      alert(error.response?.data?.error || 'Failed to remove member')
    }
  }

  // Use Case U014: Set Member Permission
  const handleSetPermission = async (memberId, newPermission, memberName) => {
    try {
      const response = await walletAPI.setMemberPermission(walletId, memberId, newPermission)
      if (response.success) {
        // Update local state
        setMembers(prev => prev.map(member => 
          member.id === memberId 
            ? { ...member, permission: newPermission }
            : member
        ))
        alert(`${memberName}'s permission updated to ${newPermission}`)
      }
    } catch (error) {
      console.error('Failed to set permission:', error)
      alert(error.response?.data?.error || 'Failed to update permission')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading wallet members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Shared Wallet Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-4 flex space-x-1">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'members' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Members ({members.length + (owner ? 1 : 0)})
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'settings' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'members' && (
            <div>
              {/* Owner Section */}
              {owner && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Owner</h3>
                  <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">👑</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{owner.name}</h4>
                        <p className="text-sm text-gray-600">{owner.email}</p>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      Owner
                    </span>
                  </div>
                </div>
              )}

              {/* Members Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Members</h3>
                  {isOwner && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      + Invite Member
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Permission Selector (Owner only) */}
                        {isOwner ? (
                          <select
                            value={member.permission}
                            onChange={(e) => handleSetPermission(member.id, e.target.value, member.name)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="view">View</option>
                            <option value="edit">Edit</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            member.permission === 'edit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.permission}
                          </span>
                        )}
                        
                        {/* Remove Member Button (Owner only) */}
                        {isOwner && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {members.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No members yet. Invite members to start collaborating!
                    </div>
                  )}
                </div>
              </div>

              {/* Leave Wallet Button (Non-owners) */}
              {!isOwner && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLeaveWallet}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Leave Wallet
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && isOwner && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Wallet Management</h3>
                <button
                  onClick={handleLeaveWallet}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Leave Wallet (Transfer Ownership)
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  As the owner, you'll need to transfer ownership before leaving.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Invite Member</h3>
              
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      inviteErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter user's email address"
                  />
                  {inviteErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{inviteErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Add a personal message to the invitation"
                    maxLength={200}
                  />
                </div>
                
                {inviteErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{inviteErrors.submit}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false)
                      setInviteForm({ email: '', message: '' })
                      setInviteErrors({})
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium"
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Transfer Ownership</h3>
              <p className="text-gray-600 mb-4">
                Please select a new owner before leaving the wallet:
              </p>
              
              <div className="space-y-3 mb-6">
                {members.map(member => (
                  <label key={member.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="newOwner"
                      value={member.id}
                      checked={selectedNewOwner === member.id}
                      onChange={(e) => setSelectedNewOwner(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferOwnership}
                  disabled={!selectedNewOwner}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium"
                >
                  Transfer & Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}