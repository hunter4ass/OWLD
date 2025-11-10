import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwXS4CraREKv3FgP4V2fqnF3WZp6_x3PQ",
  authDomain: "owldelivery-96ff0.firebaseapp.com",
  projectId: "owldelivery-96ff0",
  storageBucket: "owldelivery-96ff0.firebasestorage.app",
  messagingSenderId: "719784667697",
  appId: "1:719784667697:web:9589ee6d27d17b7fc68310",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
