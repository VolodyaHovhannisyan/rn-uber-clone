declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
    DATABASE_URL: string
    EXPO_PUBLIC_SERVER_URL: string
    EXPO_PUBLIC_GEOAPIFY_API_KEY: string
    EXPO_PUBLIC_PLACES_API_KEY: string
    EXPO_PUBLIC_DIRECTIONS_API_KEY: string
    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
    STRIPE_SECRET_KEY: string
  }
}

declare const process: {
  env: NodeJS.ProcessEnv
}