// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBFXvSwZSrMbYHQkrge6UyZOv2uxU0VkPA",
    authDomain: "emergency-qr-b0adf.firebaseapp.com",
    databaseURL: "https://emergency-qr-b0adf-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "emergency-qr-b0adf",
    storageBucket: "emergency-qr-b0adf.firebasestorage.app",
    messagingSenderId: "326186798135",
    appId: "1:326186798135:web:5b0252adb6e7e18c9303b2",
    measurementId: "G-2SP6BE9YKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
