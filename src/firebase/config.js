import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_L2W41QAu4_Adnn5n18CQfsU3zugla9s",
  authDomain: "coffee-ordering-system-3af5c.firebaseapp.com",
  projectId: "coffee-ordering-system-3af5c",
  storageBucket: "coffee-ordering-system-3af5c.firebasestorage.app",
  messagingSenderId: "684282997526",
  appId: "1:684282997526:web:6f46a7ef88de275bea7e37"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
