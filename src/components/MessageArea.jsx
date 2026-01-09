// src/components/MessageArea.jsx
import { useEffect, useRef } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { formatMessageTime } from '../utils/firestoreHelpers';

const MessageArea = ({ chatId, selectedUser }) => {
    const { messages, loading } = useMessages(chatId);
    const { currentUser } = useAuth();
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;

        try {
            await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
        } catch (err) {
            console.error('Error deleting message:', err);
            alert('Failed to delete message');
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Welcome to ChatApp
                    </h3>
                    <p className="text-gray-500">
                        Select a user from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                        <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                        </svg>
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Send a message to start the conversation</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((message) => {
                        const isSender = message.senderId === currentUser.uid;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`group relative max-w-xs lg:max-w-md xl:max-w-lg ${isSender ? 'order-2' : 'order-1'
                                        }`}
                                >
                                    {/* Message bubble */}
                                    <div
                                        className={`px-4 py-2 rounded-2xl ${isSender
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="break-words">{message.text}</p>
                                        <p
                                            className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'
                                                }`}
                                        >
                                            {formatMessageTime(message.createdAt)}
                                        </p>
                                    </div>

                                    {/* Delete button (only for sender) */}
                                    {isSender && (
                                        <button
                                            onClick={() => handleDeleteMessage(message.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                            title="Delete message"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    );
};

export default MessageArea;
