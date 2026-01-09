// src/hooks/useUsers.js
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const usersData = [];
                snapshot.forEach((doc) => {
                    // Exclude current user from the list
                    if (doc.id !== currentUser.uid) {
                        usersData.push({
                            id: doc.id,
                            ...doc.data(),
                        });
                    }
                });
                setUsers(usersData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching users:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    return { users, loading, error };
};
