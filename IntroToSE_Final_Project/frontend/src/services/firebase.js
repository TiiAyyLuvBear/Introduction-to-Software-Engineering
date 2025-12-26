// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCuxetKnCRpm4sCBRWcpuTfqTtdmEJwNMk",
    authDomain: "se-4-money.firebaseapp.com",
    projectId: "se-4-money",
    storageBucket: "se-4-money.firebasestorage.app",
    messagingSenderId: "132985259368",
    appId: "1:132985259368:web:aed705f3f1fd24fd98c2dd",
    measurementId: "G-6L3XEBR0BD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { storage };
export default auth;
