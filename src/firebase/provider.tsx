'use client';
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { initializeFirebase } from './index';

type FirebaseContextType = ReturnType<typeof initializeFirebase> | null;

const FirebaseContext = createContext<FirebaseContextType>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseContext.Provider value={firebaseServices}>
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
