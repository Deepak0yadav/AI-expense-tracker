import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Try to derive a usable Web config from android/app google-services.json when EXPO_PUBLIC_* envs are not set
function deriveConfigFromGoogleServices() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const gs = require('../app/google-services.json');
    const client0 = gs?.client?.[0];
    const projectId: string | undefined = gs?.project_info?.project_id;
    const apiKey: string | undefined = client0?.api_key?.[0]?.current_key;
    const storageBucket: string | undefined = gs?.project_info?.storage_bucket;
    const messagingSenderId: string | undefined = gs?.project_info?.project_number;
    // This is the Android appId; good enough for Auth; for Analytics prefer a Web appId from Firebase console
    const appId: string | undefined = client0?.client_info?.mobilesdk_app_id;
    // Construct standard auth domain for Web SDK
    const authDomain: string | undefined = projectId ? `${projectId}.firebaseapp.com` : undefined;

    return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } as const;
  } catch {
    return { apiKey: undefined, authDomain: undefined, projectId: undefined, storageBucket: undefined, messagingSenderId: undefined, appId: undefined } as const;
  }
}

const derived = deriveConfigFromGoogleServices();

// Prefer EXPO_PUBLIC_* envs; fall back to derived values from google-services.json for convenience
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || derived.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || derived.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || derived.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || derived.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || derived.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || derived.appId,
};

if (!firebaseConfig.apiKey) {
  // Helpful runtime warning during development
  // eslint-disable-next-line no-console
  console.warn('[firebase] Missing Firebase config. Either set EXPO_PUBLIC_FIREBASE_* envs or ensure app/google-services.json exists.');
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
