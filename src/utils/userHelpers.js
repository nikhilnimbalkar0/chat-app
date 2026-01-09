import {
    doc,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (username) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username.toLowerCase()));
        const snapshot = await getDocs(q);
        return snapshot.empty; // true if available
    } catch (error) {
        console.error('Error checking username:', error);
        throw error;
    }
};

/**
 * Create user document in Firestore with username
 */
export const createUserDocument = async (uid, name, email, username) => {
    try {
        // Check if username is available
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
            throw new Error('Username already taken');
        }

        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            uid,
            name,
            email,
            username: username.toLowerCase(),
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`,
            bio: '',
            isOnline: true,
            friends: [],
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

/**
 * Update user online/offline status
 */
export const updateUserStatus = async (uid, isOnline) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            isOnline,
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

/**
 * Subscribe to users list (for friends only)
 */
export const subscribeToUsers = (currentUserId, callback) => {
    const usersRef = collection(db, 'users');
    const q = query(
        usersRef,
        where('uid', '!=', currentUserId)
    );

    return onSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(users);
    });
};

/**
 * Get user data by ID
 */
export const getUserData = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return {
                id: userDoc.id,
                ...userDoc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
};

/**
 * Search users by username or email
 * Uses client-side filtering for better partial matching
 */
export const searchUsers = async (searchTerm, currentUserId) => {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const usersRef = collection(db, 'users');
        const searchLower = searchTerm.toLowerCase().trim();

        // Fetch all users and filter client-side
        // This is more reliable for partial matching
        const snapshot = await getDocs(usersRef);
        const users = [];

        snapshot.forEach((doc) => {
            const userData = doc.data();

            // Exclude current user
            if (userData.uid === currentUserId) {
                return;
            }

            // Check if username or email contains the search term
            const usernameMatch = userData.username && userData.username.toLowerCase().includes(searchLower);
            const emailMatch = userData.email && userData.email.toLowerCase().includes(searchLower);

            if (usernameMatch || emailMatch) {
                users.push({
                    id: doc.id,
                    ...userData
                });
            }
        });

        return users;
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        // If updating username, check availability
        if (updates.username) {
            const currentUser = await getUserData(userId);
            if (currentUser.username !== updates.username.toLowerCase()) {
                const isAvailable = await checkUsernameAvailability(updates.username);
                if (!isAvailable) {
                    throw new Error('Username already taken');
                }
                updates.username = updates.username.toLowerCase();
            }
        }

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
