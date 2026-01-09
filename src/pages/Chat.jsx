import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    // Handle user selection
    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Navbar */}
            <Navbar />

            {/* Main Chat Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Hidden on mobile when user is selected */}
                <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto`}>
                    <Sidebar
                        selectedUser={selectedUser}
                        onSelectUser={handleSelectUser}
                    />
                </div>

                {/* Chat Window - Hidden on mobile when no user is selected */}
                <div className={`${!selectedUser ? 'hidden lg:flex' : 'flex'} flex-1`}>
                    <ChatWindow selectedUser={selectedUser} />
                </div>
            </div>

            {/* Back button for mobile */}
            {selectedUser && (
                <button
                    onClick={() => setSelectedUser(null)}
                    className="lg:hidden fixed bottom-6 left-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
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
            )}
        </div>
    );
};

export default Chat;
