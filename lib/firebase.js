import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgXTDM4iSDYmj7ME0cKg2A3AO0_d00c64",
  authDomain: "itran-a82bb.firebaseapp.com",
  projectId: "itran-a82bb",
  storageBucket: "itran-a82bb.firebasestorage.app",
  messagingSenderId: "700831004430",
  appId: "1:700831004430:web:69438f038e22db56fa095f",
  measurementId: "G-HBWMX74JC3"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, storage, auth, googleProvider };
