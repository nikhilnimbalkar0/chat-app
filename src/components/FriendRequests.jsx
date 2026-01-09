import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import {
    subscribeToPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest
} from '../utils/friendHelpers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FriendRequests = ({ onClose }) => {
    const [requests, setRequests] = useState([]);
    const [requestsWithUserData, setRequestsWithUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const { user } = useAuth();

    // Subscribe to pending requests
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToPendingRequests(user.uid, (fetchedRequests) => {
            setRequests(fetchedRequests);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch sender details for each request
    useEffect(() => {
        const fetchSenderDetails = async () => {
            const requestsWithData = await Promise.all(
                requests.map(async (request) => {
                    try {
                        const senderRef = doc(db, 'users', request.senderId);
                        const senderDoc = await getDoc(senderRef);

                        if (senderDoc.exists()) {
                            return {
                                ...request,
                                senderData: senderDoc.data()
                            };
                        }
                        return request;
                    } catch (error) {
                        console.error('Error fetching sender data:', error);
                        return request;
                    }
                })
            );
            setRequestsWithUserData(requestsWithData);
        };

        if (requests.length > 0) {
            fetchSenderDetails();
        } else {
            setRequestsWithUserData([]);
        }
    }, [requests]);

    const handleAccept = async (requestId, senderId) => {
        setProcessing(requestId);
        try {
            await acceptFriendRequest(requestId, senderId, user.uid);
            // Request will be automatically removed from list via onSnapshot
        } catch (error) {
            console.error('Error accepting friend request:', error);
            alert('Failed to accept friend request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId) => {
        setProcessing(requestId);
        try {
            await rejectFriendRequest(requestId);
            // Request will be automatically removed from list via onSnapshot
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            alert('Failed to reject friend request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Friend Requests</h2>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : requestsWithUserData.length === 0 ? (
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
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                            <p className="text-gray-600 font-medium">No friend requests</p>
                            <p className="text-sm text-gray-500 mt-2">
                                When someone sends you a friend request, it will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requestsWithUserData.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-all"
                                >
                                    <div className="flex items-center space-x-3 mb-3">
                                        <img
                                            src={request.senderData?.photoURL || 'https://ui-avatars.com/api/?name=User&background=gray&color=fff'}
                                            alt={request.senderData?.name || 'User'}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {request.senderData?.name || 'Unknown User'}
                                            </h3>
                                            <p className="text-xs text-gray-600 truncate">
                                                {request.senderData?.email || ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAccept(request.id, request.senderId)}
                                            disabled={processing === request.id}
                                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                        >
                                            {processing === request.id ? 'Processing...' : 'Accept'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            disabled={processing === request.id}
                                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

FriendRequests.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default FriendRequests;
