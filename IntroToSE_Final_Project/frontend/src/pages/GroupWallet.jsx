/**
 * ============================================================================
 * GROUP WALLET PAGE - QUẢN LÝ VÍ CHUNG CHO NHÓM (UI ONLY)
 * ============================================================================
 * 
 * NHIỆM VỤ: Tạo GIAO DIỆN quản lý ví chung cho nhóm
 * (chỉ UI, dùng mock data - không cần real-time sync hay API thật)
 * 
 * ============================================================================
 * USE CASES (Tình huống sử dụng để thiết kế giao diện):
 * ============================================================================
 * 
 * 💰 GIA ĐÌNH: Chi tiêu chung, track tiền ăn/điện/nước
 * ✈️ DU LỊCH: Ghi chi phí khách sạn, vé, ăn uống, tính ai nợ ai
 * 🏠 PHÒNG TRỌ: Chia tiền điện/nước/internet
 * 📚 DỰ ÁN NHÓM: Chi phí nghiên cứu, mua thiết bị
 * 
 * ============================================================================
 * YÊU CẦU GIAO DIỆN:
 * ============================================================================
 * 
 * 1. PAGE HEADER (Trên cùng):
 *    ✅ Tiêu đề: "Group Wallets" (text-2xl font-bold)
 *    ✅ Button "Create New Group" (bg-primary, text-white, float right)
 *    ✅ Icon Users (lucide-react)
 *    ✅ Padding: p-6
 * 
 * 2. GROUP CARDS GRID (Danh sách groups):
 *    ✅ Layout: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
 *    ✅ Mỗi card hiển thị:
 *       - Background: bg-white, border, rounded-lg, shadow-md
 *       - Hover: shadow-lg, scale-105
 *       - Click: Mở modal chi tiết group
 *    
 *    ✅ Card Content:
 *       - Group Icon (top): w-16 h-16, rounded-full, bg-gradient
 *       - Tên group: text-xl font-bold text-gray-800
 *       - Mô tả: text-sm text-gray-500 (max 2 lines, ellipsis)
 *       - Total Balance: text-2xl font-bold text-green-600
 *       - Members Count: text-sm text-gray-600 (icon Users)
 *       - Member Avatars: flex -space-x-2 (tối đa 4, còn lại +N)
 *       - Badge Admin/Member: bg-blue-100 text-blue-800 (góc trên phải)
 * 
 * 3. CREATE GROUP MODAL (Khi click "Create New Group"):
 *    ✅ Modal overlay: fixed inset-0, bg-black/50, z-50
 *    ✅ Modal content: bg-white, rounded-xl, w-full max-w-md, p-6
 *    ✅ Header: "Create New Group" + Close button (X)
 *    ✅ Form fields:
 *       - Group Name (input, required)
 *       - Description (textarea, optional)
 *       - Currency (select: VND, USD, EUR, GBP)
 *       - Invite Members (input, placeholder: "email1@example.com, email2@...")
 *    ✅ Buttons:
 *       - Cancel (bg-gray-200, hover:bg-gray-300)
 *       - Create Group (bg-primary, text-white, hover:bg-primary-dark)
 * 
 * 4. GROUP DETAIL MODAL (Khi click vào group card):
 *    ✅ Modal lớn: max-w-4xl
 *    ✅ Tabs: Overview | Transactions | Members | Settings
 *    
 *    TAB OVERVIEW:
 *    ✅ Stats Cards (3 cột):
 *       - Total Income (text-green-600, icon TrendingUp)
 *       - Total Expense (text-red-600, icon TrendingDown)
 *       - Net Balance (text-blue-600, icon Wallet)
 *    ✅ Chart: Pie chart phân bổ chi phí (dùng mock data)
 *    
 *    TAB TRANSACTIONS:
 *    ✅ Button "Add Transaction" (bg-primary)
 *    ✅ Transaction list với các cột:
 *       - Date | Description | Category | Amount | Paid By | Split Between
 *    ✅ Màu: Income (text-green-600), Expense (text-red-600)
 *    
 *    TAB MEMBERS:
 *    ✅ Button "Add Member" (Admin only - hiện badge)
 *    ✅ Member list với cards:
 *       - Avatar | Name | Email | Role | Contributed Amount | Actions
 *    ✅ Actions: Promote/Demote (Admin), Remove (Admin)
 *    
 *    TAB SETTINGS (Admin only):
 *    ✅ Group Name (editable)
 *    ✅ Description (editable)
 *    ✅ Currency (editable)
 *    ✅ Delete Group (bg-red-600, confirm dialog)
 * 
 * 5. SPLIT BILL UI (Khi add transaction trong group):
 *    ✅ Checkboxes cho members: "Split between"
 *    ✅ Radio: "Split equally" hoặc "Custom amount"
 *    ✅ Hiển thị mỗi người phải trả bao nhiêu
 *    ✅ Highlight người paid (bg-blue-50)
 * 
 * 6. BALANCE SETTLEMENT (Ai nợ ai):
 *    ✅ Cards hiển thị: "A owes B: $50"
 *    ✅ Button "Mark as Settled" (bg-green-500)
 *    ✅ Icon ArrowRight giữa 2 avatars
 * 
 * ============================================================================
 * HƯỚNG DẪN XÂY DỰNG GIAO DIỆN:
 * ============================================================================
 * 
 * BƯỚC 1: SETUP STATE & MOCK DATA
 * --------------------------------
 * Import useState từ react
 * Import icons từ lucide-react: Users, Plus, Wallet, TrendingUp, TrendingDown, 
 *        Settings, UserPlus, Trash2, ArrowRight
 * 
 * Mock groups data structure:
 * - Array chứa các group objects
 * - Mỗi group có: id, name, description, balance, currency, totalIncome, totalExpense
 * - members array: id, name, email, role (admin/member), avatar URL, contributed amount
 * 
 * State cần tạo:
 * - groups: array chứa mockGroups
 * - selectedGroup: null hoặc group object được chọn
 * - showCreateModal: boolean (false)
 * - showDetailModal: boolean (false)
 * - activeTab: string ('overview', 'transactions', 'members', 'settings')
 * 
 * BƯỚC 2: PAGE HEADER & CREATE BUTTON
 * ------------------------------------
 * Page container: p-6 bg-gray-50 min-h-screen
 * 
 * Header section: flex justify-between items-center mb-6
 * - Left side: 
 *   + H1 title "Group Wallets": text-2xl font-bold với Users icon
 *   + Subtitle: text-gray-600 text-sm
 * - Right side:
 *   + Create button: bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark
 *   + Plus icon + text "Create New Group"
 *   + onClick set showCreateModal = true
 * 
 * BƯỚC 3: GROUP CARDS GRID
 * -------------------------
 * Grid container: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
 * 
 * Map qua groups array, mỗi group card có:
 * - onClick: setSelectedGroup và setShowDetailModal(true)
 * - Classes: bg-white rounded-lg shadow-md hover:shadow-lg border p-6 cursor-pointer
 *            hover:scale-105 transition-all relative
 * 
 * Card content:
 * 1. Admin Badge (góc trên phải, conditional):
 *    - absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full
 * 
 * 2. Group Icon:
 *    - w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full
 *    - Wallet icon w-8 h-8 text-white
 * 
 * 3. Group Name & Description:
 *    - H3: text-xl font-bold text-gray-800 mb-2
 *    - P: text-sm text-gray-500 mb-4 line-clamp-2
 * 
 * 4. Balance:
 *    - Amount: text-2xl font-bold text-green-600 (format with toLocaleString)
 *    - Label: text-xs text-gray-500 "Total Balance"
 * 
 * 5. Members info:
 *    - Left: Users icon + member count
 *    - Right: Member avatars (flex -space-x-2, w-8 h-8 rounded-full border-2 border-white)
 *    - Hiển thị max 4 avatars, còn lại hiện +N
 * 
 * BƯỚC 4: CREATE GROUP MODAL
 * ---------------------------
 * Conditional render khi showCreateModal = true
 * 
 * Modal overlay: fixed inset-0 bg-black/50 flex items-center justify-center z-50
 * Modal content: bg-white rounded-xl w-full max-w-md p-6
 * 
 * Modal structure:
 * 1. Header:
 *    - flex justify-between items-center mb-4
 *    - H2 title "Create New Group"
 *    - Close button (X icon) với onClick setShowCreateModal(false)
 * 
 * 2. Form (space-y-4):
 *    - Group Name input: required, placeholder "e.g., Family Budget"
 *    - Description textarea: optional, h-20
 *    - Currency select: options VND, USD, EUR, GBP
 *    - Invite Members input: placeholder "email1, email2..."
 *    - Note: text-xs text-gray-500 "Separate emails with commas"
 * 
 * 3. Buttons (flex gap-3 mt-6):
 *    - Cancel button: flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300
 *    - Create button: flex-1 bg-primary text-white hover:bg-primary-dark
 *      + onClick: log to console, setShowCreateModal(false)
 * BƯỚC 5: GROUP DETAIL MODAL (Tabs: Overview, Transactions, Members, Settings)
 * -----------------------------------------------------------------------------
 * (Tương tự structure như Create Modal, nhưng lớn hơn với tabs và nhiều section)
 * - Tabs navigation với activeTab state
 * - Overview tab: Stats cards (Income, Expense, Balance) + Charts (mock)
 * - Transactions tab: List + Add button
 * - Members tab: Member cards + Add button (Admin only)
 * - Settings tab: Edit form + Delete button (Admin only)
 * 
 * ============================================================================
 * TAILWIND CSS CLASSES REFERENCE:
 * ============================================================================
 * 
 * 📦 PAGE CONTAINER:
 * - p-6: Padding 24px
 * - bg-gray-50: Background xám nhạt
 * - min-h-screen: Chiều cao tối thiểu full screen
 * 
 * 🎴 GROUP CARD:
 * - bg-white: Background trắng
 * - rounded-lg: Bo góc 8px
 * - shadow-md: Đổ bóng vừa
 * - hover:shadow-lg: Đổ bóng lớn khi hover
 * - border border-gray-200: Viền xám nhạt
 * - p-6: Padding 24px
 * - cursor-pointer: Con trỏ pointer
 * - hover:scale-105: Phóng to 105% khi hover
 * - transition-all: Smooth transition tất cả properties
 * 
 * 🏷️ BADGES:
 * - Admin: bg-blue-100 text-blue-800
 * - Member: bg-gray-100 text-gray-600
 * - Positioned: absolute top-4 right-4
 * 
 * 👥 MEMBER AVATARS:
 * - flex -space-x-2: Overlap 8px
 * - w-8 h-8: Kích thước 32x32px
 * - rounded-full: Hình tròn
 * - border-2 border-white: Viền trắng 2px
 * 
 * 💰 BALANCE:
 * - text-2xl font-bold: Chữ to, đậm
 * - text-green-600: Màu xanh (positive)
 * - text-red-600: Màu đỏ (negative)
 * 
 * 📱 MODAL:
 * - fixed inset-0: Full screen overlay
 * - bg-black/50: Background đen 50% opacity
 * - flex items-center justify-center: Center content
 * - z-50: Z-index cao nhất
 * 
 * 📝 FORM INPUTS:
 * - w-full: Full width
 * - border border-gray-300: Viền xám
 * - rounded-lg: Bo góc 8px
 * - px-4 py-2: Padding ngang 16px, dọc 8px
 * - focus:outline-none focus:border-blue-500: Focus state
 * 
 * 🔘 BUTTONS:
 * - Primary: bg-primary text-white hover:bg-primary-dark
 * - Secondary: bg-gray-200 text-gray-700 hover:bg-gray-300
 * - Danger: bg-red-600 text-white hover:bg-red-700
 * - Success: bg-green-500 text-white hover:bg-green-600
 * 
 * 📊 STATS CARDS (trong Group Detail - Overview tab):
 * - grid grid-cols-3 gap-4: 3 cột, gap 16px
 * - bg-gradient-to-r: Gradient backgrounds
 * - from-green-500 to-green-600: Income (xanh lá)
 * - from-red-500 to-red-600: Expense (đỏ)
 * - from-blue-500 to-blue-600: Balance (xanh dương)
 * 
 * 🗂️ TABS:
 * - flex gap-2 border-b: Navigation tabs
 * - Active: border-b-2 border-primary text-primary font-semibold
 * - Inactive: text-gray-600 hover:text-gray-800
 * 
 * ============================================================================
 * MOCK DATA EXAMPLES (tiếp):
 * ============================================================================
 * 
 * Mock transactions array cho group:
 * - id, date, description, category, amount (negative for expense)
 * - paidBy: tên người trả
 * - splitBetween: array tên members tham gia split
 * 
 * Mock settlements (ai nợ ai):
 * - from: tên người nợ
 * - to: tên người được nợ
 * - amount: số tiền nợ
 * 
 * ============================================================================
 * DEMO CHECKLIST:
 * ============================================================================
 * ✅ Hiển thị danh sách group cards trong grid
 * ✅ Click "Create New Group" → mở modal
 * ✅ Fill form và click "Create" → log ra console, đóng modal
 * ✅ Click vào group card → mở detail modal với tabs
 * ✅ Switch giữa các tabs: Overview, Transactions, Members, Settings
 * ✅ Admin badge hiển thị cho groups mà user là admin
 * ✅ Member avatars hiển thị (tối đa 4, +N cho phần còn lại)
 * ✅ Balance hiển thị với format VND (toLocaleString)
 * ✅ Hover effects: shadow-lg, scale-105
 * ✅ Stats cards trong Overview tab với gradient backgrounds
 * ✅ Responsive: 1 cột trên mobile, 2 trên tablet, 3 trên desktop
 * ✅ Mock data hiển thị đầy đủ: groups, members, transactions, settlements
 * 
 * ============================================================================
 */

import React from 'react'
// import { useState } from 'react'
// import { Users, Plus, DollarSign, Settings, TrendingUp } from 'lucide-react'

export default function GroupWallet() {
  // TODO: Setup state management
  // const [groups, setGroups] = useState([])
  // const [selectedGroup, setSelectedGroup] = useState(null)
  // const [showModal, setShowModal] = useState(false)

  // TODO: Implement handleCreateGroup function

  // TODO: Implement handleViewGroup function

  // TODO: Implement handleAddMember function (Admin only)

  // TODO: Implement UI (group cards grid + modals)
  // State quản lý danh sách groups
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Family Budget',
      description: 'Chi tiêu gia đình',
      balance: 5000,
      members: [
        { id: 1, name: 'You', email: 'you@example.com', role: 'admin' },
        { id: 2, name: 'Mom', email: 'mom@example.com', role: 'member' },
        { id: 3, name: 'Dad', email: 'dad@example.com', role: 'member' }
      ],
      currency: 'USD',
      createdAt: '2025-01-01'
    },
    {
      id: 2,
      name: 'Trip to Da Nang',
      description: 'Du lịch Đà Nẵng nhóm bạn',
      balance: 1200,
      members: [
        { id: 1, name: 'You', email: 'you@example.com', role: 'admin' },
        { id: 4, name: 'Alice', email: 'alice@example.com', role: 'member' },
        { id: 5, name: 'Bob', email: 'bob@example.com', role: 'member' }
      ],
      currency: 'VND',
      createdAt: '2025-10-15'
    }
  ])

  // State quản lý modal
  const [showModal, setShowModal] = useState(false)
  
  // State quản lý group đang xem chi tiết
  const [selectedGroup, setSelectedGroup] = useState(null)
  
  // State form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'USD',
    memberEmails: ''
  })

  /**
   * Handler: Tạo group mới
   * 
   * Flow:
   * 1. Validate form (name không rỗng)
   * 2. Parse member emails (split by comma)
   * 3. Call API POST /api/groups
   * 4. Thêm vào danh sách groups
   * 5. Đóng modal và reset form
   */
  const handleCreateGroup = (e) => {
    e.preventDefault()
    
    const newGroup = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      balance: 0,
      members: [
        { id: 1, name: 'You', email: 'you@example.com', role: 'admin' }
      ],
      currency: formData.currency,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setGroups([...groups, newGroup])
    setShowModal(false)
    setFormData({ name: '', description: '', currency: 'USD', memberEmails: '' })
    
    // TODO: Call API
    console.log('Create group:', newGroup)
  }

  /**
   * Handler: Xem chi tiết group
   */
  const handleViewGroup = (group) => {
    setSelectedGroup(group)
    // TODO: Fetch group transactions
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Group Wallets</h2>
        <p className="text-gray-600">Manage shared expenses with family and friends</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Group
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => handleViewGroup(group)}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer"
          >
            {/* Group Icon & Name */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.description}</p>
                </div>
              </div>
              {/* Admin Badge */}
              {group.members[0].role === 'admin' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>

            {/* Balance */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                ${group.balance.toFixed(2)}
                <span className="text-sm text-gray-500 ml-2">{group.currency}</span>
              </p>
            </div>

            {/* Members Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{group.members.length} members</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                <span>Active</span>
              </div>
            </div>

            {/* Member Avatars */}
            <div className="flex -space-x-2 mt-4">
              {group.members.slice(0, 4).map((member, index) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                  title={member.name}
                >
                  {member.name[0]}
                </div>
              ))}
              {group.members.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Group Wallets Yet</h3>
          <p className="text-gray-600 mb-6">Create your first group to start managing shared expenses</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Create New Group Wallet</h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6">
              {/* Group Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Family Budget, Trip 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this group for?"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Currency */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option>USD</option>
                  <option>VND</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>

              {/* Add Members (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Members (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter emails separated by commas"
                  value={formData.memberEmails}
                  onChange={(e) => setFormData({...formData, memberEmails: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: friend1@email.com, friend2@email.com
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Group
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Detail Modal (TODO: Implement chi tiết group) */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedGroup(null)}>
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h3>
                <p className="text-sm text-gray-600">{selectedGroup.description}</p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setSelectedGroup(null)}
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* TODO: Implement chi tiết group */}
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Group details coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This will show transactions, member contributions, and split calculations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
