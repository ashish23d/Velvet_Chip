// @ts-nocheck
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxJdHhEo9899BIk9TPmCHGB_ygXSzruuk",
  authDomain: "awaany-5f01c.firebaseapp.com",
  projectId: "awaany-5f01c",
  storageBucket: "awaany-5f01c.firebasestorage.app",
  messagingSenderId: "262599165058",
  appId: "1:262599165058:web:bb2592d886a3cbff8e609b",
  measurementId: "G-H9VMC5KTMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
