import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { searchUsers } from '../utils/userHelpers';
import {
    sendFriendRequest,
    checkFriendRequestStatus
} from '../utils/friendHelpers';

const SearchUser = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestStatuses, setRequestStatuses] = useState({});
    const [sending, setSending] = useState(null);
    const { user: currentUser } = useAuth();

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchTerm.trim() || searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const results = await searchUsers(searchTerm, currentUser.uid);
            setSearchResults(results);

            // Check request status for each result
            const statuses = {};
            await Promise.all(
                results.map(async (user) => {
                    const status = await checkFriendRequestStatus(currentUser.uid, user.uid);
                    statuses[user.uid] = status;
                })
            );
            setRequestStatuses(statuses);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (receiverId) => {
        setSending(receiverId);
        try {
            await sendFriendRequest(currentUser.uid, receiverId);

            // Update status locally
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

    const getButtonState = (userId, userFriends) => {
        // Check if already friends
        if (userFriends && userFriends.includes(currentUser.uid)) {
            return {
                text: 'Friends',
                disabled: true,
                className: 'bg-green-100 text-green-700 cursor-default'
            };
        }

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Find People</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="flex space-x-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by username or email..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || searchTerm.trim().length < 2}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter at least 2 characters to search
                    </p>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : searchResults.length === 0 && searchTerm.trim().length >= 2 ? (
                        <div className="text-center py-12">
                            <svg
                                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <p className="text-gray-600 font-medium">No users found</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Try searching with a different username or email
                            </p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-3">
                            {searchResults.map((user) => {
                                const buttonState = getButtonState(user.uid, user.friends);

                                return (
                                    <div
                                        key={user.uid}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.name}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                                />
                                                {user.isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                    {user.name}
                                                </h3>
                                                <p className="text-xs text-gray-600 truncate">
                                                    @{user.username}
                                                </p>
                                                {user.bio && (
                                                    <p className="text-xs text-gray-500 truncate mt-1">
                                                        {user.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSendRequest(user.uid)}
                                            disabled={buttonState.disabled || sending === user.uid}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${buttonState.className} disabled:opacity-50`}
                                        >
                                            {sending === user.uid ? 'Sending...' : buttonState.text}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <p className="text-gray-600 font-medium">Search for people</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Enter a username or email to find friends
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

SearchUser.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default SearchUser;
