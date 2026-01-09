import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Send a friend request
 */
export const sendFriendRequest = async (senderId, receiverId) => {
    try {
        // Prevent sending request to self
        if (senderId === receiverId) {
            throw new Error('Cannot send friend request to yourself');
        }

        // Check if request already exists
        const existingRequest = await checkFriendRequestStatus(senderId, receiverId);
        if (existingRequest) {
            throw new Error('Friend request already exists');
        }

        // Create friend request
        const requestsRef = collection(db, 'friendRequests');
        await addDoc(requestsRef, {
            senderId,
            receiverId,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw error;
    }
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (requestId, senderId, receiverId) => {
    try {
        const senderRef = doc(db, 'users', senderId);
        const receiverRef = doc(db, 'users', receiverId);

        // Get both user documents to check if friends field exists
        const [senderDoc, receiverDoc] = await Promise.all([
            getDoc(senderRef),
            getDoc(receiverRef)
        ]);

        // Initialize friends array if it doesn't exist
        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();

        if (!senderData.friends) {
            await updateDoc(senderRef, { friends: [] });
        }
        if (!receiverData.friends) {
            await updateDoc(receiverRef, { friends: [] });
        }

        // Add each user to the other's friends array
        await updateDoc(senderRef, {
            friends: arrayUnion(receiverId)
        });

        await updateDoc(receiverRef, {
            friends: arrayUnion(senderId)
        });

        // Delete the friend request after successful acceptance
        const requestRef = doc(db, 'friendRequests', requestId);
        await deleteDoc(requestRef);

        return true;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

/**
 * Reject a friend request
 */
export const rejectFriendRequest = async (requestId) => {
    try {
        const requestRef = doc(db, 'friendRequests', requestId);
        await deleteDoc(requestRef);
        return true;
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw error;
    }
};

/**
 * Check if a friend request exists between two users
 */
export const checkFriendRequestStatus = async (userId, targetUserId) => {
    try {
        const requestsRef = collection(db, 'friendRequests');

        // Check both directions
        const q1 = query(
            requestsRef,
            where('senderId', '==', userId),
            where('receiverId', '==', targetUserId),
            where('status', '==', 'pending')
        );

        const q2 = query(
            requestsRef,
            where('senderId', '==', targetUserId),
            where('receiverId', '==', userId),
            where('status', '==', 'pending')
        );

        const [snapshot1, snapshot2] = await Promise.all([
            getDocs(q1),
            getDocs(q2)
        ]);

        if (!snapshot1.empty) {
            return {
                id: snapshot1.docs[0].id,
                type: 'sent',
                ...snapshot1.docs[0].data()
            };
        }

        if (!snapshot2.empty) {
            return {
                id: snapshot2.docs[0].id,
                type: 'received',
                ...snapshot2.docs[0].data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error checking friend request status:', error);
        throw error;
    }
};

/**
 * Subscribe to pending friend requests for a user
 */
export const subscribeToPendingRequests = (userId, callback) => {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
        requestsRef,
        where('receiverId', '==', userId),
        where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
            requests.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(requests);
    });
};

/**
 * Check if two users are friends
 */
export const areFriends = async (userId, targetUserId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const friends = userDoc.data().friends || [];
            return friends.includes(targetUserId);
        }

        return false;
    } catch (error) {
        console.error('Error checking friendship:', error);
        return false;
    }
};

/**
 * Get all users who are not friends
 */
export const getNonFriends = async (currentUserId, currentUserFriends = []) => {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        const nonFriends = [];
        snapshot.forEach((doc) => {
            const userData = doc.data();
            // Exclude current user and existing friends
            if (userData.uid !== currentUserId && !currentUserFriends.includes(userData.uid)) {
                nonFriends.push({
                    id: doc.id,
                    ...userData
                });
            }
        });

        return nonFriends;
    } catch (error) {
        console.error('Error getting non-friends:', error);
        throw error;
    }
};
