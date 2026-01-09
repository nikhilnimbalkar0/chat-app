import { useState } from 'react';
import PropTypes from 'prop-types';

const Message = ({ message, isSender }) => {
    const [showFullImage, setShowFullImage] = useState(false);

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const messageTime = formatTime(message.createdAt);

    // Render based on message type
    const renderMessageContent = () => {
        switch (message.type) {
            case 'image':
                return (
                    <>
                        <div
                            className="cursor-pointer"
                            onClick={() => setShowFullImage(true)}
                        >
                            <img
                                src={message.mediaURL}
                                alt="Shared image"
                                className="rounded-lg max-w-xs max-h-64 object-cover hover:opacity-90 transition-opacity"
                            />
                        </div>
                        {message.text && (
                            <p className="mt-2 text-sm">{message.text}</p>
                        )}

                        {/* Full Image Modal */}
                        {showFullImage && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                                onClick={() => setShowFullImage(false)}
                            >
                                <img
                                    src={message.mediaURL}
                                    alt="Full size"
                                    className="max-w-full max-h-full object-contain"
                                />
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                                    onClick={() => setShowFullImage(false)}
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                );

            case 'video':
                return (
                    <>
                        <video
                            controls
                            className="rounded-lg max-w-xs max-h-64"
                        >
                            <source src={message.mediaURL} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        {message.text && (
                            <p className="mt-2 text-sm">{message.text}</p>
                        )}
                    </>
                );

            case 'text':
            default:
                return <p className="text-sm break-words">{message.text}</p>;
        }
    };

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isSender
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
            >
                {renderMessageContent()}
                <p
                    className={`text-xs mt-1 ${isSender ? 'text-indigo-100' : 'text-gray-500'
                        }`}
                >
                    {messageTime}
                </p>
            </div>
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        text: PropTypes.string,
        mediaURL: PropTypes.string,
        senderId: PropTypes.string,
        createdAt: PropTypes.any
    }).isRequired,
    isSender: PropTypes.bool.isRequired
};

export default Message;
