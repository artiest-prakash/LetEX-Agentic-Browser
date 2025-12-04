import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc 
} from "firebase/firestore";
import { Thread, Note, Message } from '../types';

// Default config (fallback if env vars not present)
// In a real production build, these should strictly be env vars.
const defaultFirebaseConfig = {
  apiKey: "AIzaSyDTs86sNAWtot14TtJmR6Lx2Ez26WHWkxE",
  authDomain: "letex-39993.firebaseapp.com",
  projectId: "letex-39993",
  storageBucket: "letex-39993.firebasestorage.app",
  messagingSenderId: "794906742362",
  appId: "1:794906742362:web:2185c771efd85714b65263",
  measurementId: "G-FC5JE8HE41"
};

// Logic to check for Environment Variables (Vite/CRA compatible)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// --- Auth Helpers ---

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// --- Firestore Helpers ---

// Threads (Chat History)
export const saveThread = async (userId: string, threadId: string, title: string, messages: Message[]) => {
  try {
    const threadRef = doc(db, 'threads', threadId);
    await setDoc(threadRef, {
      userId,
      threadId,
      title,
      messages,
      updatedAt: Date.now()
    }, { merge: true });
    console.log("Thread saved:", threadId);
  } catch (e) {
    console.error("Error saving thread: ", e);
  }
};

export const getUserThreads = async (userId: string): Promise<Thread[]> => {
  try {
    const threadsRef = collection(db, 'threads');
    const q = query(threadsRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const threads: Thread[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      threads.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        messages: data.messages,
        updatedAt: data.updatedAt
      });
    });
    return threads;
  } catch (e) {
    console.error("Error fetching threads: ", e);
    return [];
  }
};

// Notes
export const saveNote = async (userId: string, content: string) => {
  try {
    const notesRef = collection(db, 'notes');
    await addDoc(notesRef, {
      userId,
      content,
      createdAt: Date.now()
    });
    console.log("Note saved");
  } catch (e) {
    console.error("Error saving note: ", e);
    throw e;
  }
};

export const getUserNotes = async (userId: string): Promise<Note[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const notes: Note[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        userId: data.userId,
        content: data.content,
        createdAt: data.createdAt
      });
    });
    return notes;
  } catch (e) {
    console.error("Error fetching notes: ", e);
    return [];
  }
};