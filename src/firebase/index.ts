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
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    // Initialize App Check on the client
    if (typeof window !== 'undefined') {
      const appCheck = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.reCaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
      // Listen for the first token, then consider Firebase ready.
      const unsubscribe = onTokenChanged(appCheck, (token) => {
        if (token) {
          onReady();
          unsubscribe(); // We only need the first token to be ready.
        }
      });
    } else {
      // If not in a browser, we are ready immediately (for SSR etc.)
      onReady();
    }
  } else {
    firebaseApp = getApp();
    onReady(); // App is already initialized, so we are ready.
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
