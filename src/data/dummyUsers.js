// Dummy users data for the chat application
export const dummyUsers = [
    {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=4F46E5&color=fff&size=128',
        lastMessage: 'Hey! How are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        online: true
    },
    {
        id: 2,
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10B981&color=fff&size=128',
        lastMessage: 'Thanks for your help!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        online: true
    },
    {
        id: 3,
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=F59E0B&color=fff&size=128',
        lastMessage: 'See you tomorrow!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        online: false
    },
    {
        id: 4,
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=EF4444&color=fff&size=128',
        lastMessage: 'That sounds great!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        online: false
    },
    {
        id: 5,
        name: 'Olivia Martinez',
        email: 'olivia.martinez@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Olivia+Martinez&background=8B5CF6&color=fff&size=128',
        lastMessage: 'Let me know when you\'re free',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        online: true
    },
    {
        id: 6,
        name: 'Daniel Brown',
        email: 'daniel.brown@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Daniel+Brown&background=EC4899&color=fff&size=128',
        lastMessage: 'Perfect! Talk soon.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        online: false
    }
];
