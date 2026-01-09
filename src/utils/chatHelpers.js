import {
    collection,
    doc,
    setDoc,
    getDoc,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Generate a unique chat ID for two users
 * Ensures the same chatId regardless of who initiates the chat
 */
export const generateChatId = (uid1, uid2) => {
    return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

/**
 * Create or get existing chat document
 */
export const createOrGetChat = async (uid1, uid2) => {
    const chatId = generateChatId(uid1, uid2);
    const chatRef = doc(db, 'chats', chatId);

    try {
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
            // Create new chat document
            await setDoc(chatRef, {
                participants: [uid1, uid2],
                lastMessage: '',
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });
        }

        return chatId;
    } catch (error) {
        console.error('Error creating/getting chat:', error);
        throw error;
    }
};

/**
 * Send a message to a chat
 */
export const sendMessage = async (chatId, senderId, text) => {
    if (!text.trim()) return;

    try {
        // Add message to subcollection
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            text: text.trim(),
            senderId,
            createdAt: serverTimestamp()
        });

        // Update lastMessage in chat document
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            lastMessage: text.trim(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Subscribe to messages in real-time
 */
export const subscribeToMessages = (chatId, callback) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(messages);
    });
};

/**
 * Get chat document data
 */
export const getChatData = async (chatId) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            return chatDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting chat data:', error);
        throw error;
    }
};
