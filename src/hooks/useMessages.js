// src/hooks/useMessages.js
import { useEffect, useState } from 'react';
import {
    collection,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export const useMessages = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const messagesData = [];
                snapshot.forEach((doc) => {
                    messagesData.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });
                setMessages(messagesData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching messages:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [chatId]);

    return { messages, loading, error };
};
