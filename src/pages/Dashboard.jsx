// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTyping } from '../hooks/useTyping';
import { generateChatId } from '../utils/firestoreHelpers';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageArea from '../components/MessageArea';
import MessageInput from '../components/MessageInput';

const Dashboard = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const { currentUser } = useAuth();

    // Generate chat ID when user is selected
    const chatId = selectedUser
        ? generateChatId(currentUser.uid, selectedUser.id)
        : null;

    // Typing indicator hook
    const { isOtherUserTyping, setTyping } = useTyping(
        chatId,
        selectedUser?.id
    );

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setShowSidebar(false);
    };

    const handleTyping = (isTyping) => {
        setTyping(isTyping);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 animate-fadeIn">
            {/* Sidebar - Mobile: absolute, Desktop: static */}
            <div
                className={`${showSidebar ? 'block' : 'hidden'
                    } lg:block absolute lg:relative inset-y-0 left-0 z-10 lg:z-0 transition-all duration-300`}
            >
                <Sidebar
                    selectedUser={selectedUser}
                    onSelectUser={handleSelectUser}
                    onClose={() => setShowSidebar(false)}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatHeader
                    selectedUser={selectedUser}
                    isTyping={isOtherUserTyping}
                    onMenuClick={() => setShowSidebar(true)}
                />
                <MessageArea chatId={chatId} selectedUser={selectedUser} />
                <MessageInput chatId={chatId} onTyping={handleTyping} />
            </div>
        </div>
    );
};

export default Dashboard;
