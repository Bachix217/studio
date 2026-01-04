'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, onTokenChanged } from 'firebase/app-check';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

function initializeFirebase(onReady: () => void) {
  if (getApps().length > 0) {
    firebaseApp = getApp();
    onReady();
  } else {
    firebaseApp = initializeApp(firebaseConfig);

    if (typeof window !== 'undefined') {
      
      // Add this snippet to enable debug token in development
      if (process.env.NODE_ENV === 'development') {
        // @ts-ignore
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      
      const appCheck = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.reCaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });

      const unsubscribe = onTokenChanged(appCheck, (token) => {
        if (token) {
          onReady();
          unsubscribe();
        }
      });
    } else {
      // For SSR or environments without a window object
      onReady();
    }
  }

  // Initialize other services
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  
  return { firebaseApp, auth, firestore, storage };
}

export * from './provider';
export * from './auth/use-user';
export { initializeFirebase };
