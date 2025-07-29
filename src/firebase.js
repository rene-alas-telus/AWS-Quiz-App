// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsabnihahLdtneRkM8Ghd6QBaAEywMDLM",
  authDomain: "aws-testing-8d6ac.firebaseapp.com",
  projectId: "aws-testing-8d6ac",
  storageBucket: "aws-testing-8d6ac.firebasestorage.app",
  messagingSenderId: "656047159438",
  appId: "1:656047159438:web:e69a8c3c68fbd694ecf1df",
  measurementId: "G-1Q5BZ61F5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore persistence enabled");
    })
    .catch((err) => {
      console.error("Error enabling Firestore persistence:", err);
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      }
    });
} catch (error) {
  console.error("Error in persistence setup:", error);
}

const googleProvider = new GoogleAuthProvider();

// Log Firebase initialization
console.log("Firebase initialized with project:", firebaseConfig.projectId);
console.log("Auth initialized:", !!auth);
console.log("Firestore initialized:", !!db);

export { auth, db, googleProvider };
export default app;
