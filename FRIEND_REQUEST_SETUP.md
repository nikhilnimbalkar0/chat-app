# 🚀 Friend Request System - Quick Setup Guide

## Prerequisites

✅ Firebase Authentication enabled (Email/Password)  
✅ Firestore Database created  
✅ Chat app already working

---

## Step 1: Update Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **product-site-9515d**
3. Click **Firestore Database** → **Rules** tab
4. Copy all contents from `firestore.rules` in your project
5. Paste into the rules editor
6. Click **Publish**

✅ **Done!** Security rules now enforce friend-only chat.

---

## Step 2: Handle Existing Users

**IMPORTANT**: Existing users don't have the `friends` array field.

### Option A: Fresh Start (Recommended for Testing)

1. Go to Firestore Database
2. Delete all documents in `users` collection
3. Users will re-register with new structure

### Option B: Update Existing Users

1. Go to Firestore Database → `users` collection
2. For EACH user document:
   - Click the document
   - Click **Add field**
   - Field name: `friends`
   - Field type: **array**
   - Leave empty (no items)
   - Click **Add**

---

## Step 3: Run the Application

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Step 4: Test Friend Request Flow

### Register Two Users

**User A (Alice)**:
- Name: Alice
- Email: alice@test.com
- Password: password123

**User B (Bob)**:
- Name: Bob
- Email: bob@test.com
- Password: password123

### Send Friend Request

1. Login as **Alice**
2. Sidebar shows "No friends yet"
3. Click **"Find Friends"** button
4. You'll see Bob in the list
5. Click **"Add Friend"** on Bob's card
6. Button changes to "Request Sent" ✅

### Accept Friend Request

1. Open **incognito/private window** (or different browser)
2. Go to `http://localhost:5173`
3. Login as **Bob**
4. See **red notification badge (1)** on friend requests icon
5. Click the **friend requests icon** (person with plus)
6. Modal opens showing Alice's request
7. Click **"Accept"**
8. Alice appears in Bob's sidebar ✅

### Start Chatting

1. Bob clicks on **Alice** in sidebar
2. Chat window opens
3. Bob sends message: "Hi Alice!"
4. Switch to Alice's browser
5. Alice sees **Bob** in sidebar
6. Alice clicks on Bob
7. Sees Bob's message ✅

---

## 🎯 Quick Verification Checklist

After setup, verify these work:

### Friend Requests
- [ ] Can send friend request from Discover page
- [ ] "Request Sent" appears after sending
- [ ] Notification badge shows on receiver's navbar
- [ ] Can open friend requests modal
- [ ] Can accept request
- [ ] Can reject request

### Friends List
- [ ] Only friends appear in sidebar
- [ ] Empty state shows when no friends
- [ ] "Find Friends" button navigates to Discover
- [ ] Friends update in real-time after accepting

### Chat Restrictions
- [ ] Can only chat with friends
- [ ] Cannot see non-friends in sidebar
- [ ] Messages work between friends

### Real-Time Features
- [ ] Notification badge updates instantly
- [ ] Friend list updates after accept
- [ ] Request disappears after accept/reject

---

## 🐛 Common Issues

### "No users to discover"

**Solution**: Register more users. You need at least 2 users to test.

### Notification badge not showing

**Solution**: 
1. Check browser console for errors
2. Verify Firestore rules are deployed
3. Refresh the page

### Cannot accept request

**Solution**:
1. Verify security rules are deployed
2. Check Firestore console for the request document
3. Ensure `status` field is "pending"

### Friends not appearing after accept

**Solution**:
1. Check Firestore console
2. Verify both users have each other in `friends` array
3. Refresh both browsers

### "Permission denied" errors

**Solution**:
1. Redeploy Firestore security rules
2. Make sure rules include friend request collection
3. Check browser console for specific rule that failed

---

## 📱 Features Overview

### Discover Page (`/discover`)
- Find all users who aren't your friends
- See request status for each user
- Send friend requests
- Navigate back to chat

### Friend Requests Modal
- Opens from navbar icon
- Shows pending incoming requests
- Accept or reject each request
- Real-time updates

### Sidebar
- Shows only accepted friends
- Online/offline status
- "Find Friends" button when empty
- "Find More Friends" button at bottom

### Navbar
- Friend requests icon
- Red notification badge with count
- Updates in real-time

---

## 🎉 You're All Set!

Your chat app now has a complete friend request system!

**Key Features**:
- ✅ Send/Accept/Reject friend requests
- ✅ Friend-only chat access
- ✅ User discovery page
- ✅ Real-time notifications
- ✅ Secure database rules

Start testing with multiple users to see it in action! 💬

---

## 📚 Need Help?

Check the detailed walkthrough in `walkthrough.md` for:
- Complete user flows
- Technical implementation details
- Troubleshooting guide
- Security rules explanation
