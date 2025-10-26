// Importaciones de Firebase modular (v9+)
import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { getFirestore, API_KEY } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCwq6ThCc7jCiGRx5PThFtPyujeub8RHFE",
    authDomain: "lifecapsule-10d0c.firebaseapp.com",
    databaseURL: "https://lifecapsule-10d0c-default-rtdb.firebaseio.com/",
    projectId: "lifecapsule-10d0c",
    storageBucket: "lifecapsule-10d0c.firebasestorage.app",
    messagingSenderId: "164813406396",
    appId: "1:164813406396:web:fb5e7ecf08b8bd3f9510b9",
    measurementId: "G-MWH1Y49VQX"
};

// Inicializa Firebase (evita inicializar más de una vez)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializa servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta todos los servicios y funciones necesarias
export {
    auth,
    db,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
};
