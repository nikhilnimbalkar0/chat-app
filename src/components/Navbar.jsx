import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subscribeToPendingRequests } from '../utils/friendHelpers';
import FriendRequests from './FriendRequests';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showRequests, setShowRequests] = useState(false);
    const [requestCount, setRequestCount] = useState(0);

    // Subscribe to friend requests count
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToPendingRequests(user.uid, (requests) => {
            setRequestCount(requests.length);
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <>
            <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo/Brand */}
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
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
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold">ChatApp</h1>
                        </div>

                        {/* User Info & Actions */}
                        {user && (
                            <div className="flex items-center space-x-4">
                                {/* Friend Requests Button */}
                                <button
                                    onClick={() => setShowRequests(true)}
                                    className="relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all backdrop-blur-sm"
                                    title="Friend Requests"
                                >
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
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    {requestCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {requestCount}
                                        </span>
                                    )}
                                </button>

                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium">{user.displayName || user.email?.split('@')[0]}</p>
                                    <p className="text-xs text-indigo-200">{user.email}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold backdrop-blur-sm">
                                        {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm hover:scale-105"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Friend Requests Modal */}
            {showRequests && (
                <FriendRequests onClose={() => setShowRequests(false)} />
            )}
        </>
    );
};

export default Navbar;
