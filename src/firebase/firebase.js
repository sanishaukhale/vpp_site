import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Helper to check if firebase config is populated and valid
export const firebaseEnabled = !!(
  apiKey && 
  apiKey !== "your_api_key_here" && 
  apiKey !== "YOUR_API_KEY" &&
  authDomain &&
  projectId
);

let app;
let auth = null;
let db = null;
let storage = null;

if (firebaseEnabled) {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase configuration is missing or invalid. App will run in Local Storage Mode.");
}

export { app, auth, db, storage };
export default app;
