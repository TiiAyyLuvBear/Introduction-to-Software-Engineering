<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Wallet,
  Plus,
  CreditCard,
  Briefcase,
  PiggyBank,
  Users,
} from "lucide-react";
import { walletAPI } from "../api.js";
import WalletDetailView from "../components/wallet/WalletDetailView.jsx";
import Chatbot from "../components/chatbot/Chatbot.jsx";
=======
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { api, getStoredUser } from '../lib/api.js'
import MoreMenu from '../components/MoreMenu.jsx'
import { formatMoney } from '../lib/format.js'
>>>>>>> Stashed changes

/**
 * Wallets Component - Use Case U010: Create Wallet
 */
export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletDetail, setShowWalletDetail] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [currentUserId] = useState("user123"); // TODO: get from auth
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

<<<<<<< Updated upstream
  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      type: "Cash",
      initialBalance: "",
      currency: "USD",
      description: "",
      isShared: false,
    },
  });

  // Load wallets
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getUserWallets();
      if (response.success) {
        setWallets(response.data.wallets || []);
      }
    } catch (error) {
      console.error("Failed to load wallets:", error);
      setSubmitError(error.response?.data?.error || error.message || 'Failed to load wallets');
      setWallets([]);
=======
  const me = getStoredUser()
  const myUserId = me?.id || me?._id || ''

  const [allWallets, setAllWallets] = React.useState([])
  const [status, setStatus] = React.useState('active')
  const [sortDir, setSortDir] = React.useState('asc')
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')

  const [pendingInvites, setPendingInvites] = React.useState([])
  const [inviteBusyId, setInviteBusyId] = React.useState(null)

  const loadPendingInvites = React.useCallback(async () => {
    try {
      const res = await api.listPendingInvitations()
      const list = res?.data?.invitations || res?.data?.data?.invitations || res?.invitations || []
      setPendingInvites(Array.isArray(list) ? list : [])
    } catch {
      setPendingInvites([])
    }
  }, [])

  const loadWallets = React.useCallback(async (nextStatus) => {
    try {
      const res = await api.listWallets({ status: nextStatus })
      const wallets = res?.data?.wallets || res?.data || res || []
      setAllWallets(Array.isArray(wallets) ? wallets : [])
    } catch (e) {
      setError(e?.message || 'Failed to load wallets')
    }
  }, [])

  React.useEffect(() => {
    loadWallets(status)
  }, [loadWallets, status])

  React.useEffect(() => {
    loadPendingInvites()
  }, [loadPendingInvites])

  const [query, setQuery] = React.useState('')
  const wallets = allWallets
    .filter((w) => (query ? String(w.name || '').toLowerCase().includes(query.toLowerCase()) : true))
    .slice()
    .sort((a, b) => {
      const an = String(a?.name || '').toLowerCase()
      const bn = String(b?.name || '').toLowerCase()
      return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an)
    })

  const total = wallets.reduce((s, w) => s + Number(w.balance ?? w.currentBalance ?? 0), 0)

  const toggleStatus = () => {
    setError('')
    setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))
  }

  const toggleSort = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const deleteWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    if (!window.confirm('Delete this wallet?')) return
    setBusyId(id)
    setError('')
    try {
      await api.deleteWallet(id)
      setAllWallets((prev) => prev.filter((w) => (w.id || w._id) !== id))
    } catch (e) {
      setError(e?.message || 'Failed to delete wallet')
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  // Wallet type options
  const walletTypes = [
    {
      value: "Cash",
      label: "Cash",
      icon: CreditCard,
      description: "Physical money and coins",
    },
    {
      value: "Bank",
      label: "Bank Account",
      icon: Briefcase,
      description: "Bank savings or checking account",
    },
    {
      value: "Savings",
      label: "Savings",
      icon: PiggyBank,
      description: "Long-term savings account",
    },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "VND", label: "VND (₫)", symbol: "₫" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "JPY", label: "JPY (¥)", symbol: "¥" },
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const startTime = Date.now();

      const walletData = {
        name: data.name.trim(),
        type: data.type,
        initialBalance: parseFloat(data.initialBalance || 0),
        currency: data.currency,
        description: data.description.trim(),
        isShared: data.isShared || false,
      };

      const response = await walletAPI.createWallet(walletData);

      if (response.success) {
        setWallets((prev) => [response.data, ...prev]);
        reset();
        setShowCreateModal(false);

        const endTime = Date.now();
        console.log(`Wallet created in ${endTime - startTime}ms`);
      } else {
        setSubmitError(response.error || "Failed to create wallet");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      if (error.response?.data?.code === "DUPLICATE_WALLET_NAME") {
        setSubmitError("Wallet name already in use");
      } else if (error.response?.data?.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError("Failed to create wallet. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletDetail(true);
  };

  const handleCloseWalletDetail = () => {
    setShowWalletDetail(false);
    setSelectedWallet(null);
    loadWallets();
  };

  const totalBalance = wallets.reduce((sum, wallet) => {
    const balance =
      wallet.currency === "USD"
        ? wallet.balance || wallet.currentBalance
        : (wallet.balance || wallet.currentBalance) * 0.00004;
    return sum + balance;
  }, 0);

  const getWalletIcon = (type) => {
    const iconMap = {
      Cash: CreditCard,
      Bank: Briefcase,
      Savings: PiggyBank,
    };
    const IconComponent = iconMap[type] || Wallet;
    return <IconComponent className="w-full h-full text-white" />;
  };

  const formatCurrency = (amount, currency) => {
    const currencyInfo = currencies.find((c) => c.value === currency);
    const symbol = currencyInfo ? currencyInfo.symbol : "$";
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Inner pulsing wallet icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Wallets</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const respondInvite = async (invitationId, response) => {
    if (!invitationId) return
    setInviteBusyId(invitationId)
    setError('')
    try {
      await api.respondToInvitation(invitationId, { response })
      setPendingInvites((prev) => prev.filter((i) => i.id !== invitationId))
      await loadWallets(status)
    } catch (e) {
      setError(e?.message || 'Failed to respond to invitation')
    } finally {
      setInviteBusyId(null)
    }
  }

  const [sharingWalletId, setSharingWalletId] = React.useState('')
  const sharingWallet = React.useMemo(
    () => allWallets.find((w) => String(w.id || w._id) === String(sharingWalletId)) || null,
    [allWallets, sharingWalletId]
  )
  const [membersInfo, setMembersInfo] = React.useState(null)
  const [membersBusy, setMembersBusy] = React.useState(false)

  const openSharing = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    setSharingWalletId(id)
    setMembersInfo(null)
    setMembersBusy(true)
    setError('')
    try {
      const res = await api.getWalletMembers(id)
      setMembersInfo(res?.data || res)
    } catch (e) {
      setError(e?.message || 'Failed to load members')
      setMembersInfo(null)
    } finally {
      setMembersBusy(false)
    }
  }

  const closeSharing = () => {
    setSharingWalletId('')
    setMembersInfo(null)
    setMembersBusy(false)
  }

  const [inviteEmail, setInviteEmail] = React.useState('')
  const sendInvite = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    const email = String(inviteEmail || '').trim()
    if (!email) return
    setBusyId(walletId)
    setError('')
    try {
      await api.inviteWalletMember(walletId, { email })
      setInviteEmail('')
      // No need to reload members list (invites are separate); refresh wallets to update counts.
      await loadWallets(status)
    } catch (e) {
      setError(e?.message || 'Failed to send invitation')
    } finally {
      setBusyId(null)
    }
  }

  const refreshMembers = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    setMembersBusy(true)
    try {
      const res = await api.getWalletMembers(walletId)
      setMembersInfo(res?.data || res)
    } catch (e) {
      setError(e?.message || 'Failed to refresh members')
    } finally {
      setMembersBusy(false)
    }
  }

  const setPermission = async (memberId, permission) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    setBusyId(`${walletId}:${memberId}`)
    setError('')
    try {
      await api.setWalletMemberPermission(walletId, memberId, { permission })
      await refreshMembers()
    } catch (e) {
      setError(e?.message || 'Failed to update permission')
    } finally {
      setBusyId(null)
    }
  }

  const removeMember = async (memberId) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    if (!window.confirm('Remove this member from the wallet?')) return
    setBusyId(`${walletId}:rm:${memberId}`)
    setError('')
    try {
      await api.removeWalletMember(walletId, memberId)
      await refreshMembers()
      await loadWallets(status)
    } catch (e) {
      setError(e?.message || 'Failed to remove member')
    } finally {
      setBusyId(null)
    }
  }

  const transferOwnership = async (newOwnerId) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !newOwnerId) return
    if (!window.confirm('Transfer ownership to this member?')) return
    setBusyId(`${walletId}:own:${newOwnerId}`)
    setError('')
    try {
      await api.transferWalletOwnership(walletId, { newOwnerId })
      await refreshMembers()
      await loadWallets(status)
    } catch (e) {
      setError(e?.message || 'Failed to transfer ownership')
    } finally {
      setBusyId(null)
    }
  }

  const leaveCurrentWallet = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    if (!window.confirm('Leave this wallet?')) return
    setBusyId(`leave:${walletId}`)
    setError('')
    try {
      await api.leaveWallet(walletId)
      closeSharing()
      await loadWallets(status)
    } catch (e) {
      const code = e?.data?.code
      const eligible = e?.data?.data?.eligibleMembers
      if (code === 'OWNER_CANNOT_LEAVE' && Array.isArray(eligible) && eligible.length) {
        const defaultEmail = eligible[0]?.email || ''
        const input = window.prompt(
          `You are the owner. Enter a member email to transfer ownership first:\n${eligible
            .map((m) => `${m.name || ''} <${m.email || ''}>`)
            .join('\n')}`,
          defaultEmail
        )
        if (!input) throw e
        const picked = eligible.find((m) => String(m.email || '').toLowerCase() === String(input).toLowerCase())
        if (!picked?.id) {
          const err = new Error('Member email not found')
          err.status = 400
          throw err
        }
        await api.transferWalletOwnership(walletId, { newOwnerId: picked.id })
        await api.leaveWallet(walletId)
        closeSharing()
        await loadWallets(status)
        return
      }
      setError(e?.message || 'Failed to leave wallet')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Wallets</h2>
        <p className="text-gray-600">Manage your personal and shared wallets</p>
      </div>

<<<<<<< Updated upstream
      {/* Total Balance */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 max-w-md transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-white">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-semibold text-lg">Total Balance</span>
          <Wallet className="w-10 h-10 text-white animate-bounce" />
=======
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-border-dark bg-gradient-to-br from-[#1c2b22] to-[#111813] p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <div className="text-sm font-medium text-text-secondary flex items-center gap-2">
                Total Net Worth
                <span className="material-symbols-outlined text-[16px] text-text-secondary">visibility</span>
              </div>
              <div className="mt-2 text-4xl font-bold text-white">{formatMoney(total)}</div>
              <div className="mt-2 text-xs text-text-secondary">Updated just now</div>
            </div>
          </div>
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-primary">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div className="text-white font-bold">Total Savings</div>
            </div>
            <div className="mt-3 text-2xl font-bold text-white">{formatMoney(total)}</div>
            <div className="mt-1 text-xs text-text-secondary">{wallets.length}</div>
          </div>
>>>>>>> Stashed changes
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          ${totalBalance.toFixed(2)}
        </div>
<<<<<<< Updated upstream
        <div className="text-blue-100 text-sm font-medium">
          Across {wallets.length} wallets
=======

        {pendingInvites.length ? (
          <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-white">Pending invitations</div>
                <div className="text-sm text-text-secondary">Accept or decline shared wallet invitations.</div>
              </div>
              <button
                type="button"
                onClick={loadPendingInvites}
                className="h-10 rounded-lg border border-border-dark bg-surface-dark px-4 text-sm font-semibold text-white hover:bg-border-dark"
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="rounded-xl border border-border-dark bg-surface-dark p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-white font-bold">{inv.wallet?.name}</div>
                      <div className="mt-1 text-xs text-text-secondary">
                        From {inv.inviter?.name} ({inv.inviter?.email})
                      </div>
                      {inv.message ? <div className="mt-1 text-sm text-text-secondary">“{inv.message}”</div> : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={inviteBusyId === inv.id}
                        onClick={() => respondInvite(inv.id, 'decline')}
                        className="h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={inviteBusyId === inv.id}
                        onClick={() => respondInvite(inv.id, 'accept')}
                        className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {sharingWallet ? (
          <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-white">Wallet sharing</div>
                <div className="text-sm text-text-secondary">
                  {sharingWallet.name} • {sharingWallet.isShared ? 'Shared' : 'Personal'} • Your permission:{' '}
                  {sharingWallet.myPermission || '—'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={refreshMembers}
                  disabled={membersBusy}
                  className="h-10 rounded-lg border border-border-dark bg-surface-dark px-4 text-sm font-semibold text-white hover:bg-border-dark disabled:opacity-60"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={closeSharing}
                  className="h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {sharingWallet.myPermission === 'owner' ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="h-10 rounded-lg bg-surface-dark border border-border-dark px-4 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Invite member by email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busyId === (sharingWallet.id || sharingWallet._id)}
                  onClick={sendInvite}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                >
                  Send invite
                </button>
              </div>
            ) : null}

            <div className="mt-4">
              {membersBusy ? <div className="text-sm text-text-secondary">Loading members…</div> : null}
              {!membersBusy && membersInfo?.owner ? (
                <div className="grid gap-2">
                  <div className="text-sm font-bold text-white">Owner</div>
                  <div className="rounded-xl border border-border-dark bg-surface-dark p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{membersInfo.owner.name}</div>
                      <div className="text-xs text-text-secondary">{membersInfo.owner.email}</div>
                    </div>
                    <div className="text-xs text-text-secondary">owner</div>
                  </div>

                  <div className="mt-2 text-sm font-bold text-white">Members</div>
                  {Array.isArray(membersInfo.members) && membersInfo.members.length ? (
                    membersInfo.members
                      .filter((m) => String(m.id) !== String(membersInfo.owner?.id))
                      .map((m) => {
                      const isSelf = myUserId && String(m.id) === String(myUserId)
                      const canOwnerManage = sharingWallet.myPermission === 'owner' && String(m.id) !== String(membersInfo.owner?.id)
                      return (
                        <div
                          key={m.id}
                          className="rounded-xl border border-border-dark bg-surface-dark p-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-white font-semibold">
                              {m.name} {isSelf ? <span className="text-xs text-text-secondary">(you)</span> : null}
                            </div>
                            <div className="text-xs text-text-secondary">{m.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-text-secondary">{m.permission}</div>
                            {canOwnerManage ? (
                              <MoreMenu
                                ariaLabel="Member options"
                                buttonClassName="text-text-secondary hover:text-white disabled:opacity-60"
                                items={[
                                  {
                                    label: 'Set View',
                                    icon: 'visibility',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:${m.id}`,
                                    onClick: () => setPermission(m.id, 'view'),
                                  },
                                  {
                                    label: 'Set Edit',
                                    icon: 'edit',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:${m.id}`,
                                    onClick: () => setPermission(m.id, 'edit'),
                                  },
                                  {
                                    label: 'Make Owner',
                                    icon: 'swap_horiz',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:own:${m.id}`,
                                    onClick: () => transferOwnership(m.id),
                                  },
                                  {
                                    label: 'Remove',
                                    icon: 'person_remove',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:rm:${m.id}`,
                                    onClick: () => removeMember(m.id),
                                  },
                                ]}
                              />
                            ) : null}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-border-dark bg-surface-dark p-3 text-sm text-text-secondary">
                      No members.
                    </div>
                  )}

                  {sharingWallet.isShared ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={leaveCurrentWallet}
                        disabled={busyId === `leave:${sharingWallet.id || sharingWallet._id}`}
                        className="h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                      >
                        Leave wallet
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-8">
          {error ? (
            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          {wallets.map((w) => (
            <div
              key={w.id || w._id}
              className="group relative cursor-pointer rounded-xl border border-border-dark bg-[#1c2b22] p-5 transition-all hover:border-primary/50 hover:bg-[#223329]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-border-dark text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                    {w.icon || 'account_balance_wallet'}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100">
                  <MoreMenu
                    ariaLabel="Wallet options"
                    buttonClassName="text-text-secondary hover:text-white disabled:opacity-60"
                    items={[
                      {
                        label: 'Sharing & members',
                        icon: 'group',
                        disabled: busyId === (w.id || w._id),
                        onClick: () => openSharing(w),
                      },
                      { label: 'Rename', icon: 'edit', disabled: busyId === (w.id || w._id), onClick: () => renameWallet(w) },
                      {
                        label: w?.status === 'inactive' ? 'Set Active' : 'Set Inactive',
                        icon: 'toggle_on',
                        disabled: busyId === (w.id || w._id),
                        onClick: () => toggleWalletStatus(w),
                      },
                      { label: 'Delete', icon: 'delete', disabled: busyId === (w.id || w._id), onClick: () => deleteWallet(w) },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="text-white text-lg font-bold">{w.name}</div>
                  {w.isShared ? (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">Shared</span>
                  ) : null}
                  {w.myPermission && w.myPermission !== 'owner' ? (
                    <span className="rounded-full bg-border-dark px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                      {w.myPermission}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-text-secondary">{w.type || 'Wallet'}</div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-border-dark pt-4">
                <div>
                  <div className="text-xs text-text-secondary">Balance</div>
                  <div className="mt-1 text-xl font-bold text-white">{formatMoney(Number(w.balance ?? w.currentBalance ?? 0))}</div>
                </div>
                <div className="text-xs text-text-secondary">{w.currency}</div>
              </div>
            </div>
          ))}
          {wallets.length === 0 && (
            <div className="col-span-full rounded-xl border border-border-dark bg-card-dark p-6 text-text-secondary">
              No wallets found.
            </div>
          )}
>>>>>>> Stashed changes
        </div>
      </div>

      {/* Add Wallet Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Your Wallets</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Wallet
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => handleWalletClick(wallet)}
            className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-2xl p-6 border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:rotate-12">
                  {getWalletIcon(wallet.type)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{wallet.name}</h4>
                  <p className="text-sm text-gray-600 font-medium">{wallet.type}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  wallet.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {wallet.status}
              </span>
            </div>

            <div className="text-2xl font-bold text-gray-800 mb-2">
              {formatCurrency(wallet.balance || wallet.currentBalance, wallet.currency)}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Created {new Date(wallet.createdAt).toLocaleDateString()}</span>
              {wallet.isShared && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  Shared
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 mt-3">
              {wallet.isShared ? (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{wallet.memberCount || 0} members</span>
                    {wallet.pendingInvitations > 0 && (
                      <span className="text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
                        {wallet.pendingInvitations} pending
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    → Click to manage shared wallet
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  → Click to view details & transactions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Wallet</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSubmitError("");
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Form UI (Styled & Icons) */}
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
                {/* === Wallet Name === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Wallet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Wallet name is required",
                      maxLength: { value: 50, message: "Max 50 characters" },
                      validate: (value) => {
                        const dup = wallets.find(
                          (w) => w.name.toLowerCase() === value.toLowerCase().trim()
                        );
                        return !dup || "Wallet name already exists";
                      },
                    })}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 
                    transition-all duration-200 outline-none ${
                      errors.name ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Ex: Family Cash"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* === Wallet Type === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Wallet Type <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    {walletTypes.map((type) => {
                      const isSelected = watch("type") === type.value;
                      const Icon = type.icon;

                      return (
                        <label
                          key={type.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer 
                            transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="radio"
                            {...register("type")}
                            value={type.value}
                            className="hidden"
                          />

                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Icon />
                          </div>

                          <div>
                            <div className="font-semibold text-gray-800">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* === Shared Wallet === */}
                <div>
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-300 
                    bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <input type="checkbox" {...register("isShared")} className="w-5 h-5" />

                    <div className="w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                      <Users />
                    </div>

                    <div>
                      <div className="font-semibold text-gray-800">Shared Wallet</div>
                      <div className="text-xs text-gray-500">
                        Allow multiple users to access this wallet
                      </div>
                    </div>
                  </label>
                </div>

                {/* === Currency === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Currency</label>
                  <select
                    {...register("currency")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 
                    focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                  >
                    {currencies.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* === Initial Balance === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Initial Balance</label>
                  <input
                    type="number"
                    {...register("initialBalance", {
                      min: { value: 0, message: "Balance must be ≥ 0" },
                    })}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none 
                    focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      errors.initialBalance ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.initialBalance && (
                    <p className="text-sm text-red-500 mt-1">{errors.initialBalance.message}</p>
                  )}
                </div>

                {/* === Description === */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                  <textarea
                    {...register("description", {
                      maxLength: { value: 200, message: "Max 200 characters" },
                    })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 resize-none 
                    focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none ${
                      errors.description ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Optional note..."
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {watch("description")?.length || 0}/200
                  </div>
                </div>

                {/* === Error === */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-sm">
                    {submitError}
                  </div>
                )}

                {/* === Buttons === */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSubmitError("");
                      reset();
                    }}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold 
                    hover:bg-gray-100 transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl text-white font-semibold 
                    bg-gradient-to-r from-blue-500 to-purple-600 
                    hover:from-blue-600 hover:to-purple-700
                    disabled:opacity-50 transition-all duration-200"
                  >
                    {isSubmitting ? "Creating..." : "Create Wallet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wallets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            <Wallet />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No wallets yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first wallet to start managing your finances
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Create Your First Wallet
          </button>
        </div>
      )}

      {/* Wallet Detail */}
      {showWalletDetail && selectedWallet && (
        <WalletDetailView
          wallet={selectedWallet}
          currentUserId={currentUserId}
          onClose={handleCloseWalletDetail}
          onWalletUpdate={loadWallets}
        />
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
