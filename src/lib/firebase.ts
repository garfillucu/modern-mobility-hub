
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2fs4_YMsjjpTPzGb6jW7H0qLh2bFXpZc",
  authDomain: "modernrent-16204.firebaseapp.com",
  projectId: "modernrent-16204",
  storageBucket: "modernrent-16204.firebasestorage.app",
  messagingSenderId: "830030402232",
  appId: "1:830030402232:web:1b519bf81d600df4bd9a4d",
  measurementId: "G-599MGB8L6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
