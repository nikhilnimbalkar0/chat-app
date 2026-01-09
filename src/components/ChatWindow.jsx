import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import { useAuth } from '../context/AuthContext';
import { generateChatId, createOrGetChat, sendMessage, subscribeToMessages } from '../utils/chatHelpers';

const ChatWindow = ({ selectedUser }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    // Initialize chat when user is selected
    useEffect(() => {
        if (!selectedUser || !user) {
            setMessages([]);
            setChatId(null);
            return;
        }

        const initChat = async () => {
            setLoading(true);
            try {
                const newChatId = await createOrGetChat(user.uid, selectedUser.uid);
                setChatId(newChatId);
            } catch (error) {
                console.error('Error initializing chat:', error);
            } finally {
                setLoading(false);
            }
        };

        initChat();
    }, [selectedUser, user]);

    // Subscribe to messages in real-time
    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = subscribeToMessages(chatId, (fetchedMessages) => {
            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [chatId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        // Prevent sending empty messages
        if (!inputMessage.trim() || !chatId || sending) return;

        setSending(true);
        const messageText = inputMessage.trim();
        setInputMessage(''); // Clear input immediately for better UX

        try {
            await sendMessage(chatId, user.uid, messageText);
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message on error
            setInputMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    // Show empty state when no user is selected
    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                        <svg
                            className="w-24 h-24 mx-auto text-indigo-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Welcome to ChatApp
                        </h3>
                        <p className="text-gray-600">
                            Select a user from the sidebar to start chatting
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={selectedUser.photoURL}
                            alt={selectedUser.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                        />
                        {selectedUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {selectedUser.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-center">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <Message
                            key={message.id}
                            message={message}
                            isSender={message.senderId === user.uid}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || sending}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                    >
                        {sending ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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
        </div>
    );
};

ChatWindow.propTypes = {
    selectedUser: PropTypes.object
};

export default ChatWindow;
