// src/utils/firestoreHelpers.js

/**
 * Generate a consistent chat ID from two user IDs
 * Always returns the same ID regardless of order (uid1+uid2 === uid2+uid1)
 */
export const generateChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
};

/**
 * Format Firestore timestamp to readable format
 */
export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

/**
 * Format message timestamp (shows time for today, date for older)
 */
export const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Get online status text
 */
export const getOnlineStatus = (user) => {
    if (!user) return 'Offline';

    if (user.isOnline) {
        return 'Online';
    }

    if (user.lastSeen) {
        return `Last seen ${formatTimestamp(user.lastSeen)}`;
    }

    return 'Offline';
};
