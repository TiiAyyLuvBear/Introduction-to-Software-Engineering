import React, { useState, useEffect } from 'react'

/**
 * WalletDetailView Component - Chi tiết ví và quản lý shared wallet
 * 
 * Tích hợp Use Case U011: Invite Member to Wallet trong context của ví
 * Luồng: Wallets page → Click vào ví → WalletDetailView → Invite Member
 */
export default function WalletDetailView({ wallet, currentUserId, onClose, onWalletUpdate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [members, setMembers] = useState([])
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Use Case U011: Invite Member states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', message: '' })
  const [inviteErrors, setInviteErrors] = useState({})
  const [inviting, setInviting] = useState(false)
  
  // Use Case U012: Leave Shared Wallet states
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedNewOwner, setSelectedNewOwner] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [transferring, setTransferring] = useState(false)
  
  const isOwner = wallet.ownerId === currentUserId
  const isShared = wallet.isShared

  useEffect(() => {
    if (isShared) {
      loadMembers()
    }
  }, [wallet.id, isShared])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await walletAPI.getWalletMembers(wallet.id)
      if (response.success) {
        setOwner(response.data.owner)
        setMembers(response.data.members)
      }
    } catch (error) {
      console.error('Failed to load members:', error)
      // Use mock data for testing U012 functionality
      if (wallet.isShared) {
        setOwner({
          id: 'user123',
          name: 'Tuan Anh Le',
          email: 'ltanh@gmail.com'
        })
        setMembers([
          {
            id: 'user036',
            name: 'Khuong Dinh', 
            email: 'dxkhuong@gmail.com',
            permission: 'edit',
            joinedAt: new Date('2025-03-06')
          },
          {
            id: 'user789',
            name: 'Thien An',
            email: 'nttan@gmail.com', 
            permission: 'view',
            joinedAt: new Date('2025-11-10')
          },
          {
            id: 'user456',
            name: 'Anyu Chan', 
            email: 'vtanh@gmail.com',
            permission: 'edit',
            joinedAt: new Date('2025-11-22')
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  // Use Case U011 - Main Scenario: Invitation Phase
  const handleInviteMember = async (e) => {
    e.preventDefault()
    
    // Step 3: Validation
    if (!inviteForm.email.trim()) {
      setInviteErrors({ email: 'Email is required' })
      return
    }
    
    setInviting(true)
    setInviteErrors({})
    
    try {
      // Performance tracking (requirement: < 1 second)
      const startTime = Date.now()
      
      // Steps 4-8: System processes invitation
      const response = await walletAPI.inviteMember(
        wallet.id, 
        inviteForm.email.trim(), 
        inviteForm.message.trim()
      )
      
      if (response.success) {
        const endTime = Date.now()
        console.log(`Invitation sent in ${endTime - startTime}ms`)
        
        // Step 8: Confirm to owner that invitation was sent
        setInviteForm({ email: '', message: '' })
        setShowInviteModal(false)
        
        alert('Invitation sent successfully! The user will be notified.')
        loadMembers() // Refresh member list
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      
      // Alternative Scenarios
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        // Alternative Scenario 4a: User does not exist
        setInviteErrors({ email: 'User not found' })
      } else if (error.response?.data?.code === 'ALREADY_MEMBER') {
        // Alternative Scenario 4a: User already a member
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

  // Handle input changes for invite form
  const handleInviteInputChange = (field, value) => {
    setInviteForm(prev => ({ ...prev, [field]: value }))
    if (inviteErrors[field]) {
      setInviteErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Close invite modal
  const closeInviteModal = () => {
    setShowInviteModal(false)
    setInviteForm({ email: '', message: '' })
    setInviteErrors({})
  }

  // Use Case U012: Leave Shared Wallet (Main Scenario)
  const handleLeaveWallet = async () => {
    // Step 3: System shows confirmation dialog (handled by showLeaveModal)
    setLeaving(true)
    
    try {
      // Performance tracking (requirement: < 1 second)
      const startTime = Date.now()
      
      // Step 5: System removes user from wallet
      const response = await walletAPI.leaveWallet(wallet.id)
      
      if (response.success) {
        const endTime = Date.now()
        console.log(`Left wallet in ${endTime - startTime}ms`)
        
        // Step 6: System syncs updated member list
        alert('Successfully left the wallet')
        onClose() // Close detail view and return to wallets list
      }
    } catch (error) {
      console.error('Failed to leave wallet:', error)
      
      // Alternative Scenario 4a: User is the group owner
      if (error.response?.data?.code === 'OWNER_CANNOT_LEAVE') {
        setShowLeaveModal(false)
        setShowTransferModal(true) // Show transfer ownership dialog
      } else {
        alert(error.response?.data?.error || 'Failed to leave wallet. Please try again.')
      }
    } finally {
      setLeaving(false)
    }
  }

  // Use Case U012: Transfer Ownership (Alternative Scenario 4a)
  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      alert('Please select a new owner')
      return
    }
    
    setTransferring(true)
    
    try {
      const startTime = Date.now()
      
      // System performs ownership transfer
      const response = await walletAPI.transferOwnership(wallet.id, selectedNewOwner)
      
      if (response.success) {
        const endTime = Date.now()
        console.log(`Transferred ownership in ${endTime - startTime}ms`)
        
        // After successful transfer, try to leave again
        await walletAPI.leaveWallet(wallet.id)
        
        alert('Ownership transferred and successfully left the wallet')
        onClose() // Return to wallets list
      }
    } catch (error) {
      console.error('Transfer ownership failed:', error)
      
      // Alternative Scenario 4b: Transfer fails
      alert('Transfer failed. Please try again.')
      // Owner is NOT removed (as per requirement)
    } finally {
      setTransferring(false)
    }
  }

  // Get eligible members for ownership transfer
  const eligibleMembers = members.filter(member => member.id !== currentUserId)

  // Use Case U014: Set Member Permission (Main Scenario)
  const handlePermissionChange = async (memberId, newPermission, memberName) => {
    // Alternative Scenario 2a: Owner attempts to modify their own permission
    if (memberId === currentUserId) {
      alert('You cannot change your own permission as the owner')
      return
    }

    try {
      // Performance tracking (requirement: < 5 seconds)
      const startTime = Date.now()
      
      // Step 5: System updates permission in database
      const response = await walletAPI.setMemberPermission(wallet.id, memberId, newPermission)
      
      if (response.success) {
        const endTime = Date.now()
        console.log(`Permission updated in ${endTime - startTime}ms`)
        
        // Step 6: System confirms the update
        // Update local state immediately for better UX
        setMembers(prev => prev.map(member => 
          member.id === memberId 
            ? { ...member, permission: newPermission }
            : member
        ))
        
        // Show success feedback (usability requirement: <= 2 taps)
        alert(`${memberName}'s permission updated to ${newPermission}`)
      }
    } catch (error) {
      console.error('Failed to update permission:', error)
      alert(error.response?.data?.error || 'Failed to update permission. Please try again.')
      
      // Reload members to ensure consistency
      loadMembers()
    }
  }

  // Handle remove member functionality
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this wallet?`)) {
      return
    }
    
    try {
      const response = await walletAPI.removeMember(wallet.id, memberId)
      if (response.success) {
        alert('Member removed successfully')
        loadMembers() // Refresh member list
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      alert(error.response?.data?.error || 'Failed to remove member')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <span className="text-3xl">
                {wallet.type === 'Cash' ? '💵' : 
                 wallet.type === 'Bank' ? '🏦' : '🐷'}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{wallet.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600">{wallet.type} Wallet</span>
                  {isShared && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      Shared
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl p-2"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'overview' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            {isShared && (
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
            )}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'transactions' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Transactions
            </button>
            {isShared && (
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Balance Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Balance</h3>
                <div className="text-3xl font-bold text-gray-900">
                  {wallet.currency === 'USD' ? '$' : 
                   wallet.currency === 'VND' ? '₫' : 
                   wallet.currency === 'EUR' ? '€' : '¥'}
                  {(wallet.balance || wallet.currentBalance || 0).toLocaleString()}
                </div>
                <p className="text-gray-600 mt-2">
                  Created on {new Date(wallet.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Wallet Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Wallet Type</h4>
                  <p className="text-gray-600">{wallet.type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Currency</h4>
                  <p className="text-gray-600">{wallet.currency}</p>
                </div>
                {isShared && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Members</h4>
                      <p className="text-gray-600">{members.length + (owner ? 1 : 0)} people</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Your Role</h4>
                      <p className="text-gray-600">
                        {isOwner ? 'Owner' : 'Member'}
                        {!isOwner && (
                          <span className="text-sm text-gray-500 block">
                            Permission: {members.find(m => m.id === currentUserId)?.permission || 'Unknown'}
                          </span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {wallet.description && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{wallet.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Members Tab - Use Case U011 Implementation */}
          {activeTab === 'members' && isShared && (
            <div className="space-y-6">
              {/* Member management header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Wallet Members</h3>
                  {isOwner && (
                    <p className="text-sm text-gray-600 mt-1">
                      Manage member permissions and access levels
                    </p>
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    <span>+</span>
                    Invite Member
                  </button>
                )}
              </div>
              
              {/* Permission levels explanation */}
              {isOwner && members.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Permission Levels</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><strong>View:</strong> Can see wallet balance and transactions</div>
                    <div><strong>Edit:</strong> Can add/edit transactions and manage wallet settings</div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading members...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Owner Section */}
                  {owner && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">👑</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{owner.name}</h4>
                            <p className="text-sm text-gray-600">{owner.email}</p>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Owner
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Members List - Use Case U014: Permission Management */}
                  {members.map(member => (
                    <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-700 font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Step 1-4: Owner manages member permissions */}
                        <div className="flex items-center gap-3">
                          {isOwner ? (
                            <div className="flex items-center gap-2">
                              {/* Step 3: Owner chooses permission level (2 taps max) */}
                              <select
                                value={member.permission}
                                onChange={(e) => handlePermissionChange(member.id, e.target.value, member.name)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={member.id === currentUserId}
                              >
                                <option value="view">View</option>
                                <option value="edit">Edit</option>
                              </select>
                              
                              <button
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                                title="Remove member"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              member.permission === 'edit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.permission}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Permission explanation for current user */}
                      {member.id === currentUserId && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-blue-600">
                            📝 You are viewing this wallet as a member
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {members.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="mb-2">No members yet.</p>
                      <p className="text-sm">Invite people to start collaborating!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Transaction history will be implemented here</p>
              </div>
            </div>
          )}

          {/* Use Case U012: Settings Tab with Leave Wallet */}
          {activeTab === 'settings' && isShared && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Wallet Settings</h3>
              </div>
              
              {/* Leave Wallet Section */}
              <div className="border border-red-200 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  {isOwner 
                    ? 'As the owner, you must transfer ownership before leaving this wallet.' 
                    : 'Leave this shared wallet. You will lose access to all wallet data and transactions.'}
                </p>
                
                {/* Step 2: Member taps "Leave Wallet" */}
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Leave Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Use Case U012: Leave Wallet Confirmation Modal (Step 3: System shows confirmation) */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-800">
                {isOwner ? 'Transfer Ownership Required' : 'Leave Shared Wallet'}
              </h3>
              
              {isOwner ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    As the owner of this wallet, you must transfer ownership to another member before leaving.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    This ensures the wallet remains accessible to other members.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to leave <strong>"{wallet.name}"</strong>?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-red-700">
                      ⚠️ You will permanently lose access to this wallet's data and transactions.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  disabled={leaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {isOwner ? (
                  <button
                    onClick={() => {
                      setShowLeaveModal(false)
                      setShowTransferModal(true)
                    }}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                  >
                    Transfer Ownership
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveWallet}
                    disabled={leaving}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium"
                  >
                    {leaving ? 'Leaving...' : 'Leave Wallet'}
                  </button>
                )}
              </div>
              
              {/* Performance indicator */}
              {leaving && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    <span>Leaving wallet...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Use Case U012: Transfer Ownership Modal (Alternative Scenario 4a) */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Transfer Ownership</h3>
              <p className="text-gray-600 mb-4">
                Select a member to become the new owner of <strong>"{wallet.name}"</strong>.
              </p>
              
              {eligibleMembers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No other members available for ownership transfer.</p>
                  <p className="text-sm text-gray-400">
                    You need to invite at least one member before you can leave this wallet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                  {eligibleMembers.map(member => (
                    <label key={member.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="newOwner"
                        value={member.id}
                        checked={selectedNewOwner === member.id}
                        onChange={(e) => setSelectedNewOwner(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-xs text-gray-400">
                          Permission: {member.permission} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTransferModal(false)
                    setSelectedNewOwner('')
                  }}
                  disabled={transferring}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferOwnership}
                  disabled={!selectedNewOwner || transferring || eligibleMembers.length === 0}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-medium"
                >
                  {transferring ? 'Transferring...' : 'Transfer & Leave'}
                </button>
              </div>
              
              {/* Performance indicator */}
              {transferring && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                    <span>Transferring ownership...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Use Case U011: Invite Member Modal (Step 2: System displays form) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Invite Member to {wallet.name}</h3>
              <p className="text-gray-600 mb-6">
                Invite someone to collaborate in managing this shared wallet.
              </p>
              
              <form onSubmit={handleInviteMember} className="space-y-4">
                {/* Step 3: Owner enters invitee's email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => handleInviteInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      inviteErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter user's email address"
                    disabled={inviting}
                  />
                  {inviteErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{inviteErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => handleInviteInputChange('message', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Add a personal message to the invitation"
                    maxLength={200}
                    disabled={inviting}
                  />
                  <p className="mt-1 text-sm text-gray-500">{inviteForm.message.length}/200 characters</p>
                </div>
                
                {inviteErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{inviteErrors.submit}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeInviteModal}
                    disabled={inviting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {/* Step 5: Owner taps "Send Invite" */}
                  <button
                    type="submit"
                    disabled={inviting || !inviteForm.email.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium"
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>

              {/* Performance indicator during invitation sending */}
              {inviting && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span>Sending invitation...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}