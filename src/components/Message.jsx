import PropTypes from 'prop-types';

const Message = ({ message, isSender }) => {
    // Format timestamp from Firestore
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            // Handle Firestore timestamp
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-md ${isSender
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
            >
                <p className="text-sm break-words">{message.text}</p>
                <p
                    className={`text-xs mt-1 ${isSender ? 'text-indigo-100' : 'text-gray-500'
                        }`}
                >
                    {formatTime(message.createdAt)}
                </p>
            </div>
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        text: PropTypes.string.isRequired,
        createdAt: PropTypes.any
    }).isRequired,
    isSender: PropTypes.bool.isRequired
};

export default Message;
