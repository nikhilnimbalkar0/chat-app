# Real-Time Chat Application

A complete one-to-one chat application built with React.js and Firebase, featuring real-time messaging, user authentication, and online status tracking.

## 🚀 Features

- ✅ **Firebase Authentication** - Email/Password sign-in
- ✅ **Real-Time Messaging** - Instant message delivery using Firestore
- ✅ **One-to-One Chats** - Private conversations between users
- ✅ **Online Status** - See who's online in real-time
- ✅ **Message History** - Persistent chat history
- ✅ **Responsive Design** - Works on mobile and desktop
- ✅ **Modern UI** - WhatsApp/Messenger-style interface

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## 🔧 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **Save**

### 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (we'll add security rules later)
4. Choose a location closest to your users
5. Click **Enable**

### 4. Deploy Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Copy the contents from `firestore.rules` file
3. Paste into the rules editor
4. Click **Publish**

## 📦 Installation

1. **Clone or download the project**

```bash
cd "c:\Users\nikhi\OneDrive\Desktop\Chat app\chat-app"
```

2. **Install dependencies**

```bash
npm install
```

3. **Firebase is already configured** in `src/firebase.js` with your credentials

## 🏃 Running the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📱 How to Use

### 1. Register Users

1. Open the app in your browser
2. Click "Create one" to go to the register page
3. Fill in:
   - Name
   - Email
   - Password
4. Click "Create Account"
5. You'll be automatically logged in and redirected to the chat page

### 2. Test with Multiple Users

To test the chat functionality:

1. Register a user (e.g., "Alice")
2. Logout
3. Register another user (e.g., "Bob")
4. You should see Alice in the user list
5. Click on Alice to start chatting
6. Open the app in another browser/incognito window
7. Login as Alice
8. You should see Bob in the user list
9. Click on Bob to see the chat
10. Send messages back and forth - they appear in real-time!

### 3. Features to Test

- ✅ **Real-time messaging** - Messages appear instantly
- ✅ **Online status** - Green dot shows when user is online
- ✅ **Separate chats** - Each user pair has their own chat history
- ✅ **Message persistence** - Messages are saved in Firestore
- ✅ **Auto-scroll** - Chat scrolls to latest message

## 🗂️ Project Structure

```
src/
 ├── components/
 │    ├── Sidebar.jsx          # User list with online status
 │    ├── ChatWindow.jsx        # Chat interface with real-time messages
 │    ├── Message.jsx           # Individual message component
 │    └── Navbar.jsx            # Top navigation
 ├── pages/
 │    ├── Login.jsx             # Login page
 │    ├── Register.jsx          # Registration page
 │    └── Chat.jsx              # Main chat page
 ├── context/
 │    └── AuthContext.jsx       # Firebase authentication context
 ├── utils/
 │    ├── chatHelpers.js        # Chat and message functions
 │    └── userHelpers.js        # User management functions
 ├── firebase.js                # Firebase configuration
 ├── App.jsx                    # Router and protected routes
 ├── main.jsx                   # Entry point
 └── index.css                  # Global styles
```

## 🔒 Firestore Structure

### Users Collection

```javascript
users/{userId}
  - uid: string
  - name: string
  - email: string
  - photoURL: string
  - isOnline: boolean
  - createdAt: timestamp
  - lastSeen: timestamp
```

### Chats Collection

```javascript
chats/{chatId}
  - participants: [uid1, uid2]
  - lastMessage: string
  - updatedAt: timestamp
  - createdAt: timestamp
  - messages (subcollection)
    └── {messageId}
        - text: string
        - senderId: string
        - createdAt: timestamp
```

### Chat ID Generation

The `chatId` is generated using both user IDs to ensure uniqueness:

```javascript
chatId = uid1 > uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1
```

This ensures both users always access the same chat document.

## 🔐 Security Rules

The Firestore security rules ensure:

- ✅ Only authenticated users can read/write
- ✅ Users can only access chats they're participants in
- ✅ Users can only update their own profile
- ✅ Messages cannot be deleted or modified

See `firestore.rules` for the complete rules.

## 🎨 Customization

### Change Colors

Edit `src/index.css` to customize the color scheme:

```css
/* Primary colors */
--color-primary: #4F46E5; /* Indigo */
--color-secondary: #8B5CF6; /* Purple */
```

### Change Avatar Style

Edit `src/utils/userHelpers.js` in the `createUserDocument` function:

```javascript
photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=YOUR_COLOR&color=fff&size=128`
```

## 🐛 Troubleshooting

### "Permission denied" errors

- Make sure you've deployed the Firestore security rules
- Check that Email/Password authentication is enabled

### Users not appearing in sidebar

- Make sure you've registered at least 2 users
- Check browser console for errors
- Verify Firestore database is created

### Messages not sending

- Check browser console for errors
- Verify Firestore rules are deployed
- Make sure you're logged in

## 📚 Technologies Used

- **React 19** - UI library
- **Vite** - Build tool
- **Firebase 12** - Backend services
  - Authentication
  - Firestore Database
  - Analytics
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **PropTypes** - Type checking

## 🌟 Key Features Explained

### Real-Time Updates

The app uses Firestore's `onSnapshot` listeners for real-time updates:

- **User list** - Updates when users go online/offline
- **Messages** - New messages appear instantly
- **Online status** - Shows in real-time

### Chat ID System

Each chat has a unique ID generated from both user IDs:

```javascript
generateChatId(uid1, uid2) {
  return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}
```

This ensures:
- Same chat ID regardless of who initiates
- No duplicate chats between the same users
- Easy to find existing chats

### Online Status Management

- Set to `true` on login
- Set to `false` on logout
- Updated in Firestore user document
- Real-time updates via `onSnapshot`

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your own learning!

---

**Built with ❤️ using React and Firebase**
