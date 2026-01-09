import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SearchUser from './SearchUser';

const Sidebar = ({ selectedUser, onSelectUser }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const { user: currentUser } = useAuth();
    // The 'navigate' variable and its import are removed as per the instruction's diff.

    // Fetch friends list
    useEffect(() => {
        if (!currentUser) return;

        const fetchFriends = async () => {
            try {
                // Get current user's document to get friends array
                const userRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const friendIds = userDoc.data().friends || [];

                    if (friendIds.length === 0) {
                        setFriends([]);
                        setLoading(false);
                        return;
                    }

                    // Fetch friend details
                    const friendsData = await Promise.all(
                        friendIds.map(async (friendId) => {
                            const friendRef = doc(db, 'users', friendId);
                            const friendDoc = await getDoc(friendRef);
                            if (friendDoc.exists()) {
                                return {
                                    id: friendDoc.id,
                                    ...friendDoc.data()
                                };
                            }
                            return null;
                        })
                    );

                    setFriends(friendsData.filter(f => f !== null));
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching friends:', error);
                setLoading(false);
            }
        };

        fetchFriends();

        // Set up real-time listener for user document changes
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userRef, () => {
            fetchFriends();
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Format timestamp for last seen
    const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'Recently';

        const now = new Date();
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-800">Friends</h2>
                    <p className="text-sm text-gray-600 mt-1">Loading...</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-xl font-bold text-gray-800">Friends</h2>
                <p className="text-sm text-gray-600 mt-1">
                    {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </p>
            </div>

            {/* Friend List */}
            <div className="flex-1 overflow-y-auto">
                {friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <svg
                            className="w-16 h-16 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <p className="text-gray-600 font-medium mb-2">No friends yet</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Add friends to start chatting
                        </p>
                        <button
                            onClick={() => setShowSearch(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                        >
                            Find Friends
                        </button>
                    </div>
                ) : (
                    <>
                        {friends.map((friend) => (
                            <div
                                key={friend.uid}
                                onClick={() => onSelectUser(friend)}
                                className={`flex items-center p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:bg-indigo-50 ${selectedUser?.uid === friend.uid
                                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-l-4 border-l-indigo-600'
                                    : ''
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={friend.photoURL}
                                        alt={friend.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                    />
                                    {/* Online Status */}
                                    {friend.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                {/* Friend Info */}
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {friend.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                            {friend.isOnline ? 'Online' : formatLastSeen(friend.lastSeen)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mt-1">
                                        {friend.email}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Find More Friends Button */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowSearch(true)}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <span>Find Friends</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showSearch && (
                <SearchUser onClose={() => setShowSearch(false)} />
            )}
        </div>
    );
};

Sidebar.propTypes = {
    selectedUser: PropTypes.object,
    onSelectUser: PropTypes.func.isRequired
};

export default Sidebar;
