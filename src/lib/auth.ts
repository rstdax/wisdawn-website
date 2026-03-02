import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, hasInvalidFirebaseConfig } from "./firebase";

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string) {
  if (hasInvalidFirebaseConfig) {
    throw { code: "app/firebase-config-missing" };
  }
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  if (hasInvalidFirebaseConfig) {
    throw { code: "app/firebase-config-missing" };
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";
    const shouldFallbackToRedirect =
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment";

    if (shouldFallbackToRedirect) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw error;
  }
}

export async function signOutUser() {
  return signOut(auth);
}

export function getFirebaseAuthError(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return "Something went wrong. Please try again.";
  }

  const code = String(error.code);
  const messageMap: Record<string, string> = {
    "app/firebase-config-missing": "Firebase is not configured. Add real values in your .env file before signing in.",
    "auth/invalid-api-key": "Firebase API key is invalid. Check your VITE_FIREBASE_API_KEY value.",
    "auth/app-not-authorized": "This app is not authorized for Firebase Authentication. Check Firebase project config.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    "auth/popup-closed-by-user": "Google sign-in popup was closed.",
    "auth/popup-blocked": "Popup was blocked by the browser. Please allow popups and try again.",
    "auth/cancelled-popup-request": "Another Google sign-in request was already in progress.",
    "auth/operation-not-supported-in-this-environment": "Google popup is not supported here. Retry to continue with redirect sign-in.",
    "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication settings.",
    "auth/configuration-not-found": "Google sign-in provider is not configured in this Firebase project.",
    "auth/network-request-failed": "Network error during sign-in. Check internet and retry.",
  };

  return messageMap[code] ?? "Authentication failed. Please try again.";
}
