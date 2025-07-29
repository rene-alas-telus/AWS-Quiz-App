import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Save a quiz attempt to Firestore
export const saveQuizAttempt = async (userId, quizData) => {
  try {
    console.log('saveQuizAttempt called with userId:', userId);
    console.log('quizData:', JSON.stringify(quizData, null, 2));
    
    if (!userId) {
      console.error('No userId provided to saveQuizAttempt');
      return null;
    }
    
    // Generate a unique ID for this attempt based on timestamp and exam type
    // This will help prevent duplicate saves
    const now = new Date();
    const uniqueId = `${userId}_${quizData.examTitle}_${now.getTime()}`;
    
    const attemptData = {
      userId,
      examType: quizData.examTitle || 'Unknown Exam',
      score: quizData.percentage || 0,
      passed: (quizData.percentage || 0) >= 70,
      totalQuestions: quizData.questions?.length || 0,
      correctAnswers: quizData.correctCount || 0,
      timestamp: now,
      date: now.toISOString(),
      uniqueId: uniqueId
    };
    
    console.log('Attempt data to save:', JSON.stringify(attemptData, null, 2));

    // First ensure the user document exists
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      updatedAt: now,
      lastQuizAttempt: now,
      lastAttemptId: uniqueId
    }, { merge: true });
    
    // Check if we already have a recent attempt with this uniqueId
    const userAttemptsRef = collection(db, 'users', userId, 'quizAttempts');
    const q = query(
      userAttemptsRef,
      where('uniqueId', '==', uniqueId)
    );
    
    const existingAttempts = await getDocs(q);
    
    if (!existingAttempts.empty) {
      console.log('Found existing attempt with same uniqueId, skipping save');
      const existingDoc = existingAttempts.docs[0];
      return { id: existingDoc.id, existing: true };
    }
    
    // Save the quiz attempt to the user's subcollection with the document ID as the uniqueId
    const attemptDocRef = doc(userAttemptsRef, uniqueId);
    await setDoc(attemptDocRef, attemptData);
    console.log('Quiz attempt saved with ID:', uniqueId);
    return { id: uniqueId };
  } catch (error) {
    console.error('Error in saveQuizAttempt:', error);
    console.error('Error details:', error.code, error.message);
    return { error: error.message };
  }
};

// Get the latest quiz attempts for a user
export const getLatestQuizAttempts = async (userId, limitCount = 10) => {
  try {
    console.log('Getting latest quiz attempts for user:', userId);
    const attempts = [];
    
    // Only look in the user's subcollection where we save attempts
    const userAttemptsRef = collection(db, 'users', userId, 'quizAttempts');
    const q = query(
      userAttemptsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      attempts.push({
        id: doc.id,
        ...data,
        // Ensure timestamp is serializable
        timestamp: data.timestamp instanceof Date ? 
          data.timestamp.toISOString() : 
          (typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString())
      });
    });
    
    console.log(`Found ${querySnapshot.size} attempts`);
    return attempts;
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    console.error('Error details:', error.code, error.message);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Get quiz attempts for a specific exam type
export const getQuizAttemptsByExamType = async (userId, examType) => {
  try {
    const userAttemptsRef = collection(db, 'users', userId, 'quizAttempts');
    const q = query(
      userAttemptsRef,
      where('examType', '==', examType),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const attempts = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return attempts;
  } catch (error) {
    console.error('Error getting quiz attempts by exam type:', error);
    throw error;
  }
};
