import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserDocument, updateUserStatus } from '../utils/userHelpers';
import PropTypes from 'prop-types';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Update online status
                await updateUserStatus(firebaseUser.uid, true);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Register function
    const register = async (name, email, password) => {
        try {
            // Validation
            if (!name || !email || !password) {
                throw new Error('All fields are required');
            }

            if (name.trim().length < 2) {
                throw new Error('Name must be at least 2 characters long');
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Password validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Create user document in Firestore
            await createUserDocument(firebaseUser.uid, name.trim(), email.toLowerCase().trim());

            return firebaseUser;
        } catch (error) {
            // Handle Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Email already in use');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('Password is too weak');
            } else if (error.code === 'auth/invalid-email') {
                throw new Error('Invalid email address');
            }
            throw error;
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            // Validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update online status
            await updateUserStatus(firebaseUser.uid, true);

            return firebaseUser;
        } catch (error) {
            // Handle Firebase errors
            if (error.code === 'auth/user-not-found') {
                throw new Error('No account found with this email');
            } else if (error.code === 'auth/wrong-password') {
                throw new Error('Incorrect password');
            } else if (error.code === 'auth/invalid-email') {
                throw new Error('Invalid email address');
            } else if (error.code === 'auth/invalid-credential') {
                throw new Error('Invalid email or password');
            }
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            if (user) {
                // Update offline status before signing out
                await updateUserStatus(user.uid, false);
            }
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
