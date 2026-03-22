import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence,
  Firestore,
} from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Singleton — evita reinicializar em hot-reload do Next.js
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

// ✅ OFFLINE PERSISTENCE — funciona sem internet
// Os dados são cacheados no IndexedDB do dispositivo
// Quando a internet volta, tudo sincroniza automaticamente
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Múltiplas abas abertas — apenas uma pode ter persistência
      console.warn("[Firebase] Persistência offline: múltiplas abas detectadas");
    } else if (err.code === "unimplemented") {
      // Navegador não suporta IndexedDB (raro)
      console.warn("[Firebase] Persistência offline não suportada neste navegador");
    }
  });
}

export { db, auth };
