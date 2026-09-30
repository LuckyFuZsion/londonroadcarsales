"use client"

import { getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

export function isFirebaseClientConfigured() {
  return Boolean(config.apiKey && config.authDomain && config.projectId)
}

let firebaseApp: ReturnType<typeof initializeApp> | null = null

export function getFirebaseApp() {
  if (!isFirebaseClientConfigured()) {
    throw new Error("Firebase client is not configured.")
  }

  if (firebaseApp) return firebaseApp

  const existing = getApps()[0]
  firebaseApp = existing ?? initializeApp(config)
  return firebaseApp
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp())
}
