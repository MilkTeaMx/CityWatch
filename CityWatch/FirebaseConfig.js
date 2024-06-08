// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHkWN7DRBjG54pbjlXItFKD5yPcHtXIkg",
  authDomain: "citywatch-716c2.firebaseapp.com",
  projectId: "citywatch-716c2",
  storageBucket: "citywatch-716c2.appspot.com",
  messagingSenderId: "298166312106",
  appId: "1:298166312106:web:088cdae3b4f5863a4d84d3",
  measurementId: "G-CXV0544ZSC"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP)
