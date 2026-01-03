'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

// Function to initialize Firebase services
function initializeFirebaseServices(app: FirebaseApp) {
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
}

function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    // Initialize App Check on the client
    if (typeof window !== 'undefined') {
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.reCaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } else {
    firebaseApp = getApp();
  }

  // Initialize other services after app and App Check are ready
  initializeFirebaseServices(firebaseApp);
  
  return { firebaseApp, auth, firestore, storage };
}

export * from './provider';
export * from './auth/use-user';
export { initializeFirebase };
