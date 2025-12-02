# Use Cases U011-U014: Shared Wallet Management - Implementation

## Overview
This implementation adds comprehensive shared wallet functionality to support collaborative financial management, covering Use Cases U011-U014.

## Use Cases Implemented

### U011: Invite Member to Wallet ✅
**Actor**: User (Group owner)  
**Description**: Wallet owner invites users to join shared wallets

**Implementation**:
- **Backend**: Invitation model with 7-day expiration
- **Frontend**: Invite form with real-time validation
- **Performance**: < 1 second invitation sending
- **Security**: Only wallet owners can invite

**Key Features**:
- Email-based invitations with validation
- Duplicate invitation prevention
- User existence verification
- Invitation expiration (7 days)
- Real-time status tracking

### U012: Leave Shared Wallet ✅
**Actor**: User  
**Description**: Members can leave shared wallets with ownership transfer for owners

**Implementation**:
- **Owner Protection**: Must transfer ownership before leaving
- **Auto-deletion**: Wallet deleted if no members remain
- **Confirmation**: Required dialogs prevent accidents
- **Performance**: < 1 second completion

**Key Features**:
- Ownership transfer interface
- Member eligibility validation
- Atomic operations (all-or-nothing)
- Confirmation dialogs for safety

### U013: Remove Member ✅
**Actor**: Group Owner  
**Description**: Wallet owners can remove members from shared wallets

**Implementation**:
- **Owner-only**: Security restriction enforced
- **Self-protection**: Owners cannot remove themselves
- **Confirmation**: Required dialog prevents accidents
- **Performance**: < 1 second completion

**Key Features**:
- Owner permission validation
- Member removal with confirmation
- Real-time member list updates
- Error handling for edge cases

### U014: Set Member Permission ✅
**Actor**: Group Owner  
**Description**: Owners can set View/Edit permissions for members

**Implementation**:
- **Two Levels**: View (read-only) and Edit (full access)
- **Owner Protection**: Owners cannot change own permissions
- **Real-time**: Instant permission updates
- **Performance**: < 5 seconds (requirement met)

**Key Features**:
- Permission dropdown interface
- Real-time permission changes
- Owner permission protection
- 2-tap maximum usability

## Files Added/Modified

### Backend Models

#### 1. **Enhanced Wallet Model** (`backend/models/Wallet.js`)
```javascript
// Added fields:
ownerId: ObjectId,           // Wallet owner
members: [{                  // Member list with permissions
  userId: ObjectId,
  permission: 'view'|'edit',
  joinedAt: Date
}],
invitations: [{              // Pending invitations
  inviteeEmail: String,
  status: 'pending'|'accepted'|'declined'|'expired',
  expiresAt: Date
}]
```

#### 2. **New Invitation Model** (`backend/models/Invitation.js`)
- Standalone invitation management
- 7-day auto-expiration
- Unique token generation
- Status tracking and validation

### Backend Controllers & Routes

#### 3. **Enhanced Wallets Controller** (`backend/controllers/walletsController.js`)
New endpoints:
```javascript
POST   /api/wallets/:id/invite              // U011: Send invitation
GET    /api/wallets/:id/members             // Get member list
POST   /api/wallets/:id/leave               // U012: Leave wallet  
POST   /api/wallets/:id/transfer-ownership  // U012: Transfer ownership
DELETE /api/wallets/:id/members/:memberId   // U013: Remove member
PUT    /api/wallets/:id/members/:memberId/permission  // U014: Set permission
```

#### 4. **New Invitations Controller** (`backend/routes/invitations.js`)
```javascript
GET    /api/invitations/pending             // Get user's pending invitations
POST   /api/invitations/:id/respond         // Accept/decline invitation
```

### Frontend Components

#### 5. **SharedWallet Component** (`frontend/src/components/SharedWallet.jsx`)
**Features**:
- Member management interface
- Permission editing (owner only)
- Invitation sending form
- Leave/transfer ownership flows
- Real-time member list updates

**UI Elements**:
- Tabbed interface (Members/Settings)
- Owner/member role distinction
- Permission dropdowns
- Action buttons with confirmations

#### 6. **Invitations Page** (`frontend/src/pages/Invitations.jsx`)
**Features**:
- Pending invitations list
- Accept/decline actions (1-2 taps)
- Expiration warnings
- Real-time status updates

**UI Elements**:
- Wallet information display
- Invitation messages
- Action buttons with confirmations
- Empty state handling

#### 7. **Enhanced Wallets Page** (`frontend/src/pages/Wallets.jsx`)
**New Features**:
- Shared wallet creation option
- Member management access
- Shared wallet indicators
- Pending invitation badges

### API Integration

#### 8. **Enhanced API Client** (`frontend/src/api.js`)
```javascript
walletAPI.inviteMember(walletId, email, message)
walletAPI.getWalletMembers(walletId)
walletAPI.leaveWallet(walletId)
walletAPI.transferOwnership(walletId, newOwnerId)
walletAPI.removeMember(walletId, memberId)
walletAPI.setMemberPermission(walletId, memberId, permission)

invitationAPI.getPending()
invitationAPI.respond(invitationId, 'accept'|'decline')
```

## User Experience Flow

### Invitation Flow (U011)
1. **Owner**: Opens wallet → Manage Members → Invite Member
2. **System**: Validates email → Creates invitation → Shows confirmation
3. **Invitee**: Receives notification → Opens invitations page
4. **Invitee**: Reviews invitation → Accept/Decline (1-2 taps)
5. **System**: Updates membership → Syncs across devices

### Leave Wallet Flow (U012)
1. **Member**: Opens wallet → Leave Wallet → Confirms
2. **Owner**: Leave Wallet → Transfer ownership dialog → Select new owner
3. **System**: Processes atomically → Updates all members

### Permission Management (U014)
1. **Owner**: Opens Members tab → Select member → Change permission
2. **System**: Updates immediately → Confirms change (< 5 seconds)

## Performance Metrics

| Use Case | Requirement | Implementation |
|----------|-------------|----------------|
| U011 | < 1 second | ✅ Tracked and logged |
| U012 | < 1 second | ✅ Atomic operations |
| U013 | < 1 second | ✅ Real-time updates |
| U014 | < 5 seconds | ✅ Instant UI updates |

## Security Features

1. **Authorization**: Role-based access control
2. **Validation**: Server-side input validation
3. **Tokens**: Secure invitation tokens
4. **Permissions**: Granular access control
5. **Atomic Operations**: Database consistency

## Testing Scenarios

### Happy Path
- ✅ Send invitation → Accept → Become member
- ✅ Owner transfers ownership → Leaves successfully
- ✅ Owner removes member → Member loses access
- ✅ Owner changes permission → Member access updates

### Edge Cases
- ✅ Invite non-existent user → Error message
- ✅ Owner tries to leave → Transfer ownership required
- ✅ Expired invitation → Auto-cleanup
- ✅ Network failure → Retry mechanisms

### Alternative Scenarios
- ✅ Duplicate invitations prevented
- ✅ Owner cannot remove self
- ✅ Permission sync failures handled
- ✅ Confirmation dialogs prevent accidents

## Database Schema Updates

```javascript
// Wallets Collection
{
  // ... existing fields ...
  isShared: Boolean,
  ownerId: ObjectId,
  members: [{
    userId: ObjectId,
    permission: 'view' | 'edit',
    joinedAt: Date
  }]
}

// Invitations Collection (New)
{
  walletId: ObjectId,
  inviterId: ObjectId,
  inviteeEmail: String,
  inviteeId: ObjectId,
  status: 'pending' | 'accepted' | 'declined' | 'expired',
  invitationToken: String,
  expiresAt: Date,
  message: String
}
```

## Future Enhancements

1. **Real-time Notifications**: Push notifications for invitations
2. **Bulk Operations**: Invite multiple members at once
3. **Advanced Permissions**: Custom permission levels
4. **Audit Logs**: Track all member actions
5. **Member Limits**: Set maximum members per wallet
6. **Integration**: Email service for invitation delivery

---

*This implementation fully satisfies Use Cases U011-U014 with comprehensive shared wallet management, maintaining security, performance, and usability requirements.*