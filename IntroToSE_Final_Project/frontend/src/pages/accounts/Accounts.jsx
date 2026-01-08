import React from 'react'
import userService from '../../services/userService'
import { useToast } from '../../components/Toast.jsx'

export default function Accounts() {
  const toast = useToast()
  const [user, setUser] = React.useState(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phoneNumber: '',
    avatarURL: ''
  })
  const fileInputRef = React.useRef(null)

  // Fetch user profile from MongoDB on mount
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getCurrentUser()
        if (response.data && response.data.user) {
          const userData = response.data.user
          console.log('[Accounts] Fetched user from MongoDB:', userData)

          setUser(userData)
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            avatarURL: userData.avatarURL || ''
          })

          // Optionally update localStorage for other components that might rely on it
          // but we prioritize the fresh data from API
          localStorage.setItem('ml_user', JSON.stringify(userData))
        }
      } catch (error) {
        console.error('[Accounts] Failed to fetch user profile:', error)
        // If fetch fails, we might still have localStorage fallback, 
        // but user asked to use API primarily. 
        const storedUser = localStorage.getItem('ml_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            avatarURL: userData.avatarURL || ''
          })
        }
      }
    }

    fetchUser()
  }, [])

  const handleRefreshProfile = async () => {
    try {
      setIsSyncing(true)
      // Refresh user data from backend (GET /users/me)
      const response = await userService.getCurrentUser()

      if (response.data && response.data.user) {
        const userData = response.data.user
        console.log('[Accounts] Refreshed user:', userData)
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          avatarURL: userData.avatarURL || ''
        })
        localStorage.setItem('ml_user', JSON.stringify(userData))
        toast.success('Profile refreshed successfully!')
      }
    } catch (error) {
      console.error('[Accounts] Refresh profile error:', error)
      toast.error(error?.message || 'Failed to refresh profile')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Refactored upload logic to be reusable
  const processImageUpload = async (file) => {
    if (!file) return

    try {
      setIsUploading(true)

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 2MB')
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files are allowed (JPG, PNG, GIF, WebP)')
        return
      }

      // Upload to backend (returns Base64 string, does NOT save to DB yet)
      const data = await userService.uploadAvatar(file)
      console.log('[processImageUpload] Upload response:', data)

      const avatarURL = data.data?.avatarURL || data.avatarURL

      console.log('[processImageUpload] New avatarURL:', avatarURL?.substring(0, 50))

      // Only update form data for preview - don't save to DB yet
      setFormData(prev => ({
        ...prev,
        avatarURL: avatarURL
      }))

      toast.success('Avatar uploaded! Click Save Changes to update your profile.')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    await processImageUpload(file)
  }

  // Drag & Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload an image (JPG, PNG, GIF, or WebP).')
        return
      }
      await processImageUpload(file)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      setIsSyncing(true)

      console.log('[Accounts] Calling updateProfile API with data:', formData)

      // Call API to update profile
      const response = await accountService.updateProfile(formData)

      console.log('[Accounts] API response:', response)

      // Update local user state with response from MongoDB backend
      if (response.user) {
        const updatedUser = {
          ...user,
          ...response.user
        }
        setUser(updatedUser)

        // Update form data to reflect saved values
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phoneNumber: updatedUser.phoneNumber || '',
          avatarURL: updatedUser.avatarURL || ''
        })

        // Update localStorage
        localStorage.setItem('ml_user', JSON.stringify(updatedUser))
      }

      // Exit edit mode
      setIsEditing(false)

      // Show success message
      toast.success('Profile updated successfully!')

    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        avatarURL: user.avatarURL || ''
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="px-4 py-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-text-secondary">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">My Profile</h1>
            <p className="mt-2 text-text-secondary">Manage your personal information</p>
          </div>
          <button
            type="button"
            onClick={handleRefreshProfile}
            disabled={isSyncing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">{isSyncing ? 'sync' : 'refresh'}</span>
            {isSyncing ? 'Refreshing...' : 'Refresh Profile'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="mt-8 rounded-xl border border-border-dark bg-card-dark overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                {user.avatarURL ? (
                  <img
                    src={user.avatarURL.startsWith('http') || user.avatarURL.startsWith('data:') ? user.avatarURL : `http://localhost:4000${user.avatarURL}`}
                    alt={user.name}
                    className="size-24 rounded-full border-4 border-background-dark object-cover"
                  />
                ) : (
                  <div className="size-24 rounded-full border-4 border-background-dark bg-border-dark flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 size-8 rounded-full bg-primary flex items-center justify-center border-2 border-background-dark">
                  <span className="material-symbols-outlined text-[16px] text-background-dark">verified</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-text-secondary mt-1">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1">
                  <span className="size-2 rounded-full bg-primary"></span>
                  <span className="text-xs font-medium text-primary">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-dark">
                  <h3 className="text-lg font-bold text-white">Personal Information</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-110"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                    <div className="text-white font-medium">{user.name || 'Not set'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                    <div className="text-white font-medium">{user.email || 'Not set'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                    <div className="text-white font-medium">{user.phoneNumber || 'Not set'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">User ID</label>
                    <div className="text-white font-medium font-mono text-sm">{user?.id || user?._id || 'N/A'}</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border-dark">
                  <h4 className="text-sm font-bold text-white mb-4">Account Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                        <div>
                          <div className="text-sm font-medium text-white">Email Notifications</div>
                          <div className="text-xs text-text-secondary">Receive updates via email</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">security</span>
                        <div>
                          <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                          <div className="text-xs text-text-secondary">Add extra security to your account</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-dark">
                  <h3 className="text-lg font-bold text-white">Edit Personal Information</h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-sm font-semibold text-text-secondary hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">{isSyncing ? 'sync' : 'save'}</span>
                      {isSyncing ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-lg bg-surface-dark border border-input-border text-white placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-lg bg-surface-dark border border-input-border text-white placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="mt-1 text-xs text-text-secondary">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-lg bg-surface-dark border border-input-border text-white placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="+84 123 456 789"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                      Avatar Image
                    </label>
                    <div className="flex items-start gap-4">
                      {/* Avatar Preview */}
                      <div className="relative">
                        {formData.avatarURL ? (
                          <img
                            src={formData.avatarURL.startsWith('http') || formData.avatarURL.startsWith('data:') ? formData.avatarURL : `http://localhost:4000${formData.avatarURL}`}
                            alt="Avatar preview"
                            className="size-24 rounded-full border-4 border-border-dark object-cover"
                          />
                        ) : (
                          <div className="size-24 rounded-full border-4 border-border-dark bg-border-dark flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                              {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white animate-spin">sync</span>
                          </div>
                        )}
                      </div>

                      {/* Drag & Drop Upload Zone */}
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />

                        {/* Drop Zone */}
                        <div
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          className={
                            `relative rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                              ? 'border-primary bg-primary/10 scale-105'
                              : 'border-input-border bg-surface-dark hover:border-primary/50 hover:bg-surface-dark/80'
                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`
                          }
                        >
                          {isUploading ? (
                            // Uploading State
                            <div className="flex flex-col items-center gap-3">
                              <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                              <div>
                                <p className="text-sm font-medium text-white">Uploading...</p>
                                <p className="text-xs text-text-secondary mt-1">Please wait</p>
                              </div>
                            </div>
                          ) : isDragging ? (
                            // Dragging State
                            <div className="flex flex-col items-center gap-3">
                              <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                              <div>
                                <p className="text-sm font-medium text-primary">Drop image here</p>
                                <p className="text-xs text-text-secondary mt-1">Release to upload</p>
                              </div>
                            </div>
                          ) : (
                            // Default State
                            <div className="flex flex-col items-center gap-3">
                              <span className="material-symbols-outlined text-4xl text-text-secondary">upload_file</span>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  <span className="text-primary">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  JPG, PNG, GIF or WebP (Max 5MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* URL Input (Optional) */}
                        {formData.avatarURL && !isUploading && (
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              Or paste image URL
                            </label>
                            <input
                              type="text"
                              name="avatarURL"
                              value={formData.avatarURL}
                              onChange={handleInputChange}
                              className="w-full h-10 px-3 rounded-lg bg-surface-dark border border-input-border text-white text-xs placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              placeholder="https://example.com/avatar.jpg or /uploads/avatars/..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-text-secondary">Wallets</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-text-secondary">Transactions</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">savings</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-text-secondary">Goals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
