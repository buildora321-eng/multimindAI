// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "multimindai-93793.firebaseapp.com",
  projectId: "multimindai-93793",
  storageBucket: "multimindai-93793.firebasestorage.app",
  messagingSenderId: "109803493565",
  appId: "1:109803493565:web:c7ea04b453bdeff97fffd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider= new GoogleAuthProvider()