'use client';
import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';


type FirebaseContextType = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  loading: boolean;
} | null;


const FirebaseContext = createContext<FirebaseContextType>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  
  const firebaseServices = useMemo(() => {
    // Pass a callback to update loading state once Firebase/AppCheck is ready.
    const services = initializeFirebase(() => setLoading(false)); 
    return services;
  }, []);

  const value = { ...firebaseServices, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
