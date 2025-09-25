const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const admin = require('firebase-admin');

// Firebase configuration from your console
const firebaseConfig = {
    apiKey: "AIzaSyBULEy3UrxoHKe0imh6AxCRuE1jtcox0Uo",
    authDomain: "smartbin-841a3.firebaseapp.com",
    databaseURL: "https://smartbin-841a3-default-rtdb.firebaseio.com",
    projectId: "smartbin-841a3",
    storageBucket: "smartbin-841a3.firebasestorage.app",
    messagingSenderId: "862506737585",
    appId: "1:862506737585:web:8766b187d2cdd537ade790",
    measurementId: "G-HLGSQ6R4XB"
};

// Initialize Firebase client SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Admin SDK (for server-side operations)
// Using a simple initialization for development
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            projectId: firebaseConfig.projectId
        });
    } catch (error) {
        console.log('Firebase Admin already initialized or error:', error.message);
    }
}

const adminDb = admin.firestore();

module.exports = {
    db,           // Client SDK for frontend
    adminDb,      // Admin SDK for backend
    firebaseConfig
};
