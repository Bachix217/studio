'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, onTokenChanged, CustomProvider } from 'firebase/app-check';

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
      let appCheckProvider;

      // Use a debug token in development to avoid reCAPTCHA errors.
      // Make sure to set this in your browser's window object.
      // e.g., self.FIREBASE_APPCHECK_DEBUG_TOKEN = "your-debug-token";
      if (process.env.NODE_ENV === 'development') {
          console.log("Initializing App Check with debug token support.");
          appCheckProvider = new CustomProvider({
             getToken: () => {
                const debugToken = (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN;
                if(debugToken){
                    console.log("Using Firebase App Check debug token.");
                    return Promise.resolve({ token: debugToken, expireTimeMillis: Date.now() + 60 * 60 * 1000 });
                } else {
                    // Fallback to ReCaptcha if no debug token is found in development
                    return new ReCaptchaEnterpriseProvider(firebaseConfig.reCaptchaKey).getToken();
                }
             }
          });
      } else {
          // Use ReCaptcha in production
          appCheckProvider = new ReCaptchaEnterpriseProvider(firebaseConfig.reCaptchaKey);
      }
      
      const appCheck = initializeAppCheck(firebaseApp, {
        provider: appCheckProvider,
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
