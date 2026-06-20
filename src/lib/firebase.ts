import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

if (!import.meta.env.DEV) {
  const missing = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'].filter(k => !import.meta.env[k]);
  if (missing.length) {
    console.warn('Firebase environment variables appear to be missing:', missing.join(', '));
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function createUserProfile(uid: string, userData: Record<string, unknown>) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
}

export async function createMedicalRecord(uid: string, data: Record<string, unknown>) {
  const recordRef = doc(db, 'medical_records', uid);
  await setDoc(recordRef, data);
}

export async function updateMedicalRecord(uid: string, data: Record<string, unknown>) {
  const recordRef = doc(db, 'medical_records', uid);
  await setDoc(recordRef, { ...data, updatedAt: serverTimestamp() }, { merge: true } as any);
}

export const firebaseAuth = {
  signup: async (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
  signin: async (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
  signout: async () => signOut(auth),
  getUserDoc: async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  },
};

export const getMedicalRecord = async (uid: string) => {
  const rec = await getDoc(doc(db, 'medical_records', uid));
  return rec.exists() ? rec.data() : null;
};
