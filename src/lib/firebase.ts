// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validar configuración
function validateFirebaseConfig() {
  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missingKeys = requiredKeys.filter((key) => !process.env[key])

  if (missingKeys.length > 0) {
    console.error("❌ Faltan variables de entorno de Firebase:", missingKeys)
    throw new Error(`Configuración de Firebase incompleta. Faltan: ${missingKeys.join(", ")}`)
  }

  console.log("✅ Configuración de Firebase validada")
}

// Validar configuración al cargar
validateFirebaseConfig()

// Inicializar Firebase
let app: FirebaseApp
let db: Firestore
let auth: Auth

try {
  // Verificar si ya hay una app inicializada
  if (getApps().length === 0) {
    console.log("🔄 Inicializando Firebase...")
    app = initializeApp(firebaseConfig)
    console.log("✅ Firebase inicializado correctamente")
  } else {
    console.log("✅ Usando instancia existente de Firebase")
    app = getApps()[0]
  }

  // Inicializar Firestore
  db = getFirestore(app)
  console.log("✅ Firestore inicializado")

  // Inicializar Auth
  auth = getAuth(app)
  console.log("✅ Auth inicializado")

  // Conectar a emuladores en desarrollo si están configurados
  if (process.env.NODE_ENV === "development") {
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
      console.log("🔧 Conectando a emuladores de Firebase...")

      try {
        connectFirestoreEmulator(db, "localhost", 8080)
        connectAuthEmulator(auth, "http://localhost:9099")
        console.log("✅ Conectado a emuladores de Firebase")
      } catch (error) {
        console.warn("⚠️ No se pudo conectar a emuladores:", error)
      }
    }
  }
} catch (error) {
  console.error("❌ Error inicializando Firebase:", error)
  throw new Error(
    `Error de inicialización de Firebase: ${error instanceof Error ? error.message : "Error desconocido"}`,
  )
}

// Función para verificar conexión
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log("🔄 Probando conexión a Firebase...")

    // Intentar una operación simple en Firestore
    const { collection, getDocs, limit, query } = await import("firebase/firestore")
    const testQuery = query(collection(db, "test"), limit(1))
    await getDocs(testQuery)

    console.log("✅ Conexión a Firebase exitosa")
    return true
  } catch (error) {
    console.error("❌ Error de conexión a Firebase:", error)
    return false
  }
}

// Función para obtener información de configuración (sin exponer claves)
export function getFirebaseInfo() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    isEmulator: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true",
    environment: process.env.NODE_ENV,
  }
}

export { app, db, auth }
export default app
