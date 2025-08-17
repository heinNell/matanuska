/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite's built-in env variables
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly SSR: boolean

  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_DATABASE_URL: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string

  // Firebase Optional Configs
  readonly VITE_FIREBASE_DATABASE_ID?: string
  readonly VITE_FIREBASE_FUNCTIONS_URL?: string
  readonly VITE_FIREBASE_FUNCTIONS_REGION?: string
  readonly VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST?: string
  readonly VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT?: string
  readonly VITE_FIREBASE_FUNCTIONS_EMULATOR_REGION?: string

  // Google Maps
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_GOOGLE_MAPS_IFRAME_URL?: string
  readonly VITE_MAPS_SERVICE_URL?: string

  // Wialon Integration
  readonly VITE_WIALON_SESSION_TOKEN?: string
  readonly VITE_WIALON_HOST_AUTOLOGIN_URL?: string
  readonly VITE_WIALON_TOKEN?: string
  readonly VITE_WIALON_API_URL?: string
  readonly VITE_WIALON_LOGIN_URL?: string
  readonly VITE_DISABLE_WIALON_INTEGRATION?: string

  // Vercel Deployment
  readonly VERCEL?: string
  readonly VERCEL_ENV?: 'development' | 'preview' | 'production'
  readonly VERCEL_URL?: string
  readonly VERCEL_REGION?: string
  readonly VERCEL_PROJECT_ID?: string
  readonly VERCEL_GIT_PROVIDER?: string
  readonly VERCEL_GIT_REPO_SLUG?: string
  readonly VERCEL_GIT_REPO_OWNER?: string
  readonly VERCEL_GIT_REPO_ID?: string
  readonly VERCEL_GIT_COMMIT_REF?: string
  readonly VERCEL_GIT_COMMIT_SHA?: string
  readonly VERCEL_GIT_COMMIT_MESSAGE?: string
  readonly VERCEL_GIT_COMMIT_AUTHOR_LOGIN?: string
  readonly VERCEL_GIT_COMMIT_AUTHOR_NAME?: string

  // Project Metadata
  readonly VITE_PROJECT_NAME?: string
  readonly VITE_PROJECT_OWNER?: string
  readonly VITE_PROJECT_ID?: string

  // Dynamic catch-all for other variables
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
