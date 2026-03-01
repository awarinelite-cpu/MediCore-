// src/firebase.js
// ─────────────────────────────────────────────────────────────
// Replace the values below with your Firebase project credentials.
// Firebase Console → Project Settings → Your apps → SDK setup
// ─────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Enable offline persistence (PWA offline support)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence: multiple tabs open')
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence: browser not supported')
  }
})

// ─────────────────────────────────────────────────────────────
// DATA FETCHING HELPERS
// These replace the MOCK_DATA once Firestore is populated.
// ─────────────────────────────────────────────────────────────

/** Fetch all diagnoses */
export async function fetchDiagnoses() {
  const snap = await getDocs(collection(db, 'diagnoses'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Fetch types for a diagnosis */
export async function fetchTypes(diagnosisId) {
  const q = query(
    collection(db, 'diagnosis_types'),
    where('diagnosis_id', '==', diagnosisId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Fetch all detail for a selected type */
export async function fetchTypeDetails(typeId) {
  const [labsSnap, medsSnap, nursingSnap] = await Promise.all([
    getDocs(query(collection(db, 'lab_tests'), where('diagnosis_type_id', '==', typeId))),
    getDocs(query(collection(db, 'medications'), where('diagnosis_type_id', '==', typeId))),
    getDocs(
      query(collection(db, 'nursing_considerations'), where('diagnosis_type_id', '==', typeId))
    ),
  ])

  const medications = await Promise.all(
    medsSnap.docs.map(async (medDoc) => {
      const med = { id: medDoc.id, ...medDoc.data() }

      const [dosagesSnap, sideEffectsSnap] = await Promise.all([
        getDocs(query(collection(db, 'medication_dosages'), where('medication_id', '==', med.id))),
        getDocs(query(collection(db, 'side_effects'), where('medication_id', '==', med.id))),
      ])

      med.dosages = dosagesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      med.side_effects = sideEffectsSnap.docs.map((d) => d.data().effect)
      return med
    })
  )

  return {
    lab_tests: labsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    medications,
    nursing_considerations: nursingSnap.docs.map((d) => d.data().consideration),
  }
}
