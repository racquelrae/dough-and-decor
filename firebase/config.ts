import { Platform } from "react-native";
import { getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

// Firebase configuration
const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

// Initialize Firebase only once
const existingApps = getApps();
const app = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);

let auth: Auth;
if (existingApps.length) {
  auth = getAuth(app);
} else if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);
const functions = getFunctions(app);
export { app, auth, db, functions };
