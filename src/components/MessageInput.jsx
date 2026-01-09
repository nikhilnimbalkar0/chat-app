// src/components/MessageInput.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const MessageInput = ({ chatId, onTyping }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const { currentUser } = useAuth();

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        // Notify typing
        if (onTyping) {
            onTyping(e.target.value.length > 0);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !chatId || sending) return;

        try {
            setSending(true);
            const messagesRef = collection(db, 'chats', chatId, 'messages');

            await addDoc(messagesRef, {
                text: message.trim(),
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
                type: 'text',
            });

            setMessage('');
            // Clear typing indicator
            if (onTyping) {
                onTyping(false);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    if (!chatId) {
        return null;
    }

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {sending ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
