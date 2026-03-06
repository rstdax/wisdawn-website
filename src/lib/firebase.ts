import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const cleanEnvValue = (value: string | undefined) => {
  if (!value) return value;
  return value.trim().replace(/^"(.*)"$/, "$1").replace(/,$/, "");
};

const firebaseConfig = {
  apiKey: cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
};

const isPlaceholderValue = (value: string | undefined) => {
  if (!value) return true;
  const trimmed = value.trim();
  return (
    trimmed === "" ||
    trimmed.startsWith("your_") ||
    trimmed.includes("your_project") ||
    trimmed.includes("example")
  );
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => isPlaceholderValue(value))
  .map(([key]) => key);

export const hasInvalidFirebaseConfig = missingConfig.length > 0;

if (hasInvalidFirebaseConfig) {
  console.error(
    `Invalid Firebase environment values: ${missingConfig.join(", ")}. Set real Firebase credentials in your .env file.`,
  );
}

const firebaseConfigForInit = {
  apiKey: firebaseConfig.apiKey || "missing-api-key",
  authDomain: firebaseConfig.authDomain || "missing-auth-domain.firebaseapp.com",
  projectId: firebaseConfig.projectId || "missing-project-id",
  storageBucket: firebaseConfig.storageBucket || "missing-project-id.appspot.com",
  messagingSenderId: firebaseConfig.messagingSenderId || "000000000000",
  appId: firebaseConfig.appId || "1:000000000000:web:missingappid",
};

export const app = initializeApp(firebaseConfigForInit);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
