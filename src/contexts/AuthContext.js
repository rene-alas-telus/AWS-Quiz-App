import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create a user document in Firestore
  async function createUserDocument(user) {
    if (!user) {
      console.error('No user provided to createUserDocument');
      return;
    }

    console.log('Creating user document for:', user.uid);
    console.log('User object:', JSON.stringify({
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid
    }));

    // First try the direct approach with setDoc
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Always update the user document, using merge to preserve existing data
      await setDoc(userRef, {
        email: user.email || 'unknown@example.com',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      console.log('User document created or updated successfully with setDoc');
      
      // Create a test quiz attempt to verify permissions
      try {
        const attemptsRef = collection(db, 'users', user.uid, 'quizAttempts');
        const testAttempt = {
          examType: 'Test Attempt',
          score: 100,
          passed: true,
          totalQuestions: 1,
          correctAnswers: 1,
          timestamp: new Date(),
          date: new Date().toISOString()
        };
        
        console.log('Creating test quiz attempt:', JSON.stringify(testAttempt));
        const docRef = await addDoc(attemptsRef, testAttempt);
        console.log('Test quiz attempt created successfully with ID:', docRef.id);
        return true;
      } catch (attemptError) {
        console.error('Error creating test quiz attempt:', attemptError);
      }
    } catch (error) {
      console.error('Error creating user document with setDoc:', error);
      console.error('Error details:', error.code, error.message);
      
      // Try alternative approach with top-level collection
      try {
        console.log('Trying alternative: creating user in users collection with addDoc');
        const usersCollection = collection(db, 'users');
        const userData = {
          uid: user.uid,
          email: user.email || 'unknown@example.com',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        console.log('User data to save:', JSON.stringify(userData));
        const docRef = await addDoc(usersCollection, userData);
        console.log('User document created with addDoc, ID:', docRef.id);
        
        // Try creating a test attempt in a top-level collection
        const attemptsCollection = collection(db, 'quizAttempts');
        const testAttempt = {
          userId: user.uid,
          examType: 'Test Attempt',
          score: 100,
          passed: true,
          totalQuestions: 1,
          correctAnswers: 1,
          timestamp: new Date(),
          date: new Date().toISOString()
        };
        
        console.log('Creating test quiz attempt in top-level collection:', JSON.stringify(testAttempt));
        const attemptRef = await addDoc(attemptsCollection, testAttempt);
        console.log('Test quiz attempt created in top-level collection with ID:', attemptRef.id);
        return true;
      } catch (fallbackError) {
        console.error('Error with alternative approach:', fallbackError);
        return false;
      }
    }
  }

  // Sign up with email and password
  async function signup(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Create user document in Firestore
      await createUserDocument(result.user);
      
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create user document in Firestore
      await createUserDocument(result.user);
      
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create or update user document whenever a user logs in
        await createUserDocument(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
