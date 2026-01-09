# 🚀 Quick Setup Guide

## Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **product-site-9515d**
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if first time)
5. Click **Sign-in method** tab
6. Click **Email/Password**
7. Toggle **Enable**
8. Click **Save**

✅ **Done!** Email/Password authentication is now enabled.

---

## Step 2: Create Firestore Database

1. In Firebase Console, click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules next)
4. Click **Next**
5. Choose a location (e.g., **us-central** or closest to you)
6. Click **Enable**

✅ **Done!** Firestore database is created.

---

## Step 3: Deploy Security Rules

1. In Firestore Database, click the **Rules** tab
2. Delete all existing rules
3. Open the file `firestore.rules` in your project
4. Copy all the contents
5. Paste into the Firebase Console rules editor
6. Click **Publish**

✅ **Done!** Security rules are deployed.

---

## Step 4: Run the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## Step 5: Test the Chat App

### Register First User

1. Click **"Create one"** to go to register page
2. Fill in:
   - Name: **Alice**
   - Email: **alice@test.com**
   - Password: **password123**
3. Click **Create Account**
4. You'll be logged in and see the chat page
5. The user list will be empty (no other users yet)

### Register Second User

1. Click **Logout**
2. Click **"Create one"** again
3. Fill in:
   - Name: **Bob**
   - Email: **bob@test.com**
   - Password: **password123**
4. Click **Create Account**
5. You should now see **Alice** in the user list with a green dot (online)

### Start Chatting

1. Click on **Alice** in the sidebar
2. Type a message: **"Hi Alice!"**
3. Press Enter or click Send
4. Message appears on the right side

### Test Real-Time (Optional)

1. Open another browser window (or incognito mode)
2. Go to `http://localhost:5173`
3. Login as Alice (alice@test.com / password123)
4. Click on **Bob** in the sidebar
5. You should see Bob's message
6. Send a reply: **"Hi Bob!"**
7. Switch back to the first window
8. The message appears instantly! 🎉

---

## ✅ Verification Checklist

- [ ] Email/Password authentication enabled in Firebase Console
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] App running at localhost:5173
- [ ] Can register new users
- [ ] Can login/logout
- [ ] Users appear in sidebar
- [ ] Online status shows (green dot)
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Each user pair has separate chat

---

## 🐛 Common Issues

### "Missing or insufficient permissions"

**Solution**: Make sure you've deployed the Firestore security rules (Step 3)

### "Auth/operation-not-allowed"

**Solution**: Enable Email/Password authentication in Firebase Console (Step 1)

### Users not appearing in sidebar

**Solution**: 
- Make sure you've registered at least 2 users
- Check that Firestore database is created
- Open browser console (F12) and check for errors

### Messages not sending

**Solution**:
- Verify security rules are deployed
- Check browser console for errors
- Make sure you're logged in

---

## 🎉 You're All Set!

Your real-time chat application is now fully functional with:

- ✅ Firebase Authentication
- ✅ Real-time messaging
- ✅ Online status tracking
- ✅ Secure Firestore rules

Enjoy chatting! 💬
