import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import EmojiPickerComponent from './EmojiPickerComponent';
import { useAuth } from '../context/AuthContext';
import { generateChatId, createOrGetChat, sendMessage, sendMediaMessage, subscribeToMessages } from '../utils/chatHelpers';
import { uploadImage, uploadVideo } from '../utils/mediaHelpers';

const ChatWindow = ({ selectedUser }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
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

    const handleEmojiClick = (emoji) => {
        setInputMessage(prev => prev + emoji);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !chatId) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const imageURL = await uploadImage(file, chatId, (progress) => {
                setUploadProgress(progress);
            });

            await sendMediaMessage(chatId, user.uid, imageURL, 'image');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !chatId) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const videoURL = await uploadVideo(file, chatId, (progress) => {
                setUploadProgress(progress);
            });

            await sendMediaMessage(chatId, user.uid, videoURL, 'video');
        } catch (error) {
            console.error('Error uploading video:', error);
            alert(error.message || 'Failed to upload video');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (videoInputRef.current) {
                videoInputRef.current.value = '';
            }
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
                            Select a friend to start chatting
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
                {uploading && (
                    <div className="flex justify-end">
                        <div className="bg-indigo-100 rounded-lg p-4 max-w-xs">
                            <p className="text-sm text-indigo-700 mb-2">Uploading...</p>
                            <div className="w-full bg-indigo-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    {/* Image Upload */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || !chatId}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
                        title="Upload image"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Video Upload */}
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploading || !chatId}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
                        title="Upload video"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Emoji Picker */}
                    <EmojiPickerComponent onEmojiClick={handleEmojiClick} />

                    {/* Text Input */}
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending || uploading}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || sending || uploading}
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
