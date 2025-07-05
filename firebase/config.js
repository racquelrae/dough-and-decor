// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBD6eP8K8nUKyfJ3DSxDbtQnBWWTyKz5Zc",
  authDomain: "dough-and-decor.firebaseapp.com",
  projectId: "dough-and-decor",
  storageBucket: "dough-and-decor.firebasestorage.app", 
  messagingSenderId: "582729680515",
  appId: "1:582729680515:web:3008dc1db284c2f2653db6"
};

// Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };
