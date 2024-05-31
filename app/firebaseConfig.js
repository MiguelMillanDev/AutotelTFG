// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBILY2SXA7ipC-Q9RsM-rMk1OMk1zUsf1Q",
  authDomain: "autotelbd.firebaseapp.com",
  projectId: "autotelbd",
  storageBucket: "autotelbd.appspot.com",
  messagingSenderId: "590445986253",
  appId: "1:590445986253:web:dfad9d6af1aff5f2768484",
  measurementId: "G-HJW34J193Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
