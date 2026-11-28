// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: "multimindai-93793.firebaseapp.com",
//   projectId: "multimindai-93793",
//   storageBucket: "multimindai-93793.firebasestorage.app",
//   messagingSenderId: "109803493565",
//   appId: "1:109803493565:web:c7ea04b453bdeff97fffd4"
// };
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "multimindai-4a5c3.firebaseapp.com",
  projectId: "multimindai-4a5c3",
  storageBucket: "multimindai-4a5c3.firebasestorage.app",
  messagingSenderId: "1060687207469",
  appId: "1:1060687207469:web:710cdf82ca8fbf38506ca4",
  measurementId: "G-2R6PG7W89Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
// const analytics = getAnalytics(app);
export const googleProvider= new GoogleAuthProvider()