// src/hooks/useTyping.js
import { useEffect, useState, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useTyping = (chatId, otherUserId) => {
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const { currentUser } = useAuth();
    const typingTimeoutRef = useRef(null);

    // Listen to other user's typing status
    useEffect(() => {
        if (!chatId || !otherUserId) {
            setIsOtherUserTyping(false);
            return;
        }

        const typingRef = doc(db, 'typing', chatId);

        const unsubscribe = onSnapshot(typingRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setIsOtherUserTyping(data[otherUserId] === true);
            } else {
                setIsOtherUserTyping(false);
            }
        });

        return () => unsubscribe();
    }, [chatId, otherUserId]);

    // Update current user's typing status
    const setTyping = async (isTyping) => {
        if (!chatId || !currentUser) return;

        try {
            const typingRef = doc(db, 'typing', chatId);
            await setDoc(
                typingRef,
                { [currentUser.uid]: isTyping },
                { merge: true }
            );

            // Auto-clear typing status after 3 seconds
            if (isTyping) {
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(async () => {
                    await setDoc(
                        typingRef,
                        { [currentUser.uid]: false },
                        { merge: true }
                    );
                }, 3000);
            }
        } catch (err) {
            console.error('Error updating typing status:', err);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return { isOtherUserTyping, setTyping };
};
