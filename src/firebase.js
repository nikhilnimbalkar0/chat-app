import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEyIBMo5hW0x3padDh2Yik0hQqht7Kkwc",
    authDomain: "product-site-9515d.firebaseapp.com",
    projectId: "product-site-9515d",
    storageBucket: "product-site-9515d.firebasestorage.app",
    messagingSenderId: "196535212449",
    appId: "1:196535212449:web:b472f70df6da8c3c13d3e0",
    measurementId: "G-G64KXQNFKZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };

// Providers
export const googleProvider = new GoogleAuthProvider();

// Utilities
export { serverTimestamp, Timestamp };
