import {
    collection,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid, name, email) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            uid,
            name,
            email,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`,
            isOnline: true,
            friends: [], // Initialize empty friends array
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

/**
 * Update user online status
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
 * Subscribe to all users except current user
 */
export const subscribeToUsers = (currentUserId, callback) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', currentUserId));

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
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
};
