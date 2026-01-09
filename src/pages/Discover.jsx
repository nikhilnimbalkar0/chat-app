import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    getNonFriends,
    sendFriendRequest,
    checkFriendRequestStatus
} from '../utils/friendHelpers';

const Discover = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestStatuses, setRequestStatuses] = useState({});
    const [sending, setSending] = useState(null);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // Fetch non-friends
    useEffect(() => {
        if (!currentUser) return;

        const fetchUsers = async () => {
            try {
                // Get current user's friends array
                const userRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userRef);
                const friends = userDoc.exists() ? (userDoc.data().friends || []) : [];

                // Get all non-friends
                const nonFriends = await getNonFriends(currentUser.uid, friends);
                setUsers(nonFriends);

                // Check request status for each user
                const statuses = {};
                await Promise.all(
                    nonFriends.map(async (user) => {
                        const status = await checkFriendRequestStatus(currentUser.uid, user.uid);
                        statuses[user.uid] = status;
                    })
                );
                setRequestStatuses(statuses);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser]);

    const handleSendRequest = async (receiverId) => {
        setSending(receiverId);
        try {
            await sendFriendRequest(currentUser.uid, receiverId);

            // Update request status locally
            setRequestStatuses(prev => ({
                ...prev,
                [receiverId]: {
                    type: 'sent',
                    status: 'pending'
                }
            }));
        } catch (error) {
            console.error('Error sending friend request:', error);
            alert(error.message || 'Failed to send friend request');
        } finally {
            setSending(null);
        }
    };

    const getButtonState = (userId) => {
        const status = requestStatuses[userId];

        if (!status) {
            return {
                text: 'Add Friend',
                disabled: false,
                className: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
            };
        }

        if (status.type === 'sent') {
            return {
                text: 'Request Sent',
                disabled: true,
                className: 'bg-gray-300 text-gray-600 cursor-not-allowed'
            };
        }

        if (status.type === 'received') {
            return {
                text: 'Accept Request',
                disabled: false,
                className: 'bg-green-600 text-white hover:bg-green-700'
            };
        }

        return {
            text: 'Add Friend',
            disabled: false,
            className: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/chat')}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Discover People</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <svg
                            className="w-20 h-20 text-gray-400 mx-auto mb-4"
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
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No users to discover
                        </h3>
                        <p className="text-gray-600">
                            You've already connected with everyone!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user) => {
                            const buttonState = getButtonState(user.uid);

                            return (
                                <div
                                    key={user.uid}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200"
                                >
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="relative">
                                            <img
                                                src={user.photoURL}
                                                alt={user.name}
                                                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100 shadow-md"
                                            />
                                            {user.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {user.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 truncate">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {user.isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSendRequest(user.uid)}
                                        disabled={buttonState.disabled || sending === user.uid}
                                        className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${buttonState.className} disabled:opacity-50`}
                                    >
                                        {sending === user.uid ? 'Sending...' : buttonState.text}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;
