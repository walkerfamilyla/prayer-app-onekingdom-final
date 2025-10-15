import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA_Z9NvRViT6td-GKnn0Gt5s02epK-VbI8",
  authDomain: "onekingdom-prayer-app.firebaseapp.com",
  databaseURL: "https://onekingdom-prayer-app-default-rtdb.firebaseio.com",
  projectId: "onekingdom-prayer-app",
  storageBucket: "onekingdom-prayer-app.firebasestorage.app",
  messagingSenderId: "704224386549",
  appId: "1:704224386549:web:e22998cb68e6bfc52d14bc"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
