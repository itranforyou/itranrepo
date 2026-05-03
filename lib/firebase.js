import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCW7X-FqESpHvRD2e6pBSF2Nxo0btEwmYw",
  authDomain: "trial-ae883.firebaseapp.com",
  projectId: "trial-ae883",
  storageBucket: "trial-ae883.firebasestorage.app",
  messagingSenderId: "768634287869",
  appId: "1:768634287869:web:83c62edf9e0f2772def094"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, storage, auth, googleProvider };
