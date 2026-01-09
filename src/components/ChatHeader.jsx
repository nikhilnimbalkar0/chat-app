// src/components/ChatHeader.jsx
import { useAuth } from '../context/AuthContext';
import { getOnlineStatus } from '../utils/firestoreHelpers';

const ChatHeader = ({ selectedUser, isTyping, onMenuClick }) => {
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            {selectedUser ? (
                <>
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                    >
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    {/* User info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                            <img
                                src={selectedUser.photo || 'https://via.placeholder.com/40'}
                                alt={selectedUser.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                            ></div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                                {selectedUser.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {isTyping ? (
                                    <span className="text-blue-500 font-medium">typing...</span>
                                ) : (
                                    getOnlineStatus(selectedUser)
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Logout button */}
                    <button
                        onClick={handleSignOut}
                        className="ml-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    {/* No chat selected */}
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-white"
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
                        <h3 className="font-semibold text-gray-800">ChatApp</h3>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </>
            )}
        </div>
    );
};

export default ChatHeader;
