/**
 * Centralized environment helpers with clear dev fallbacks.
 * Auth.js requires `AUTH_SECRET` — without it every /api/auth/* route returns 500.
 */

const DEV_AUTH_SECRET = "hunarhub-dev-secret-replace-in-production";

export function getAuthSecret(): string {
  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[env] AUTH_SECRET is not set. Using a development-only fallback. " +
        "Run: npm run setup:env"
    );
    return DEV_AUTH_SECRET;
  }

  throw new Error(
    "AUTH_SECRET is required. Copy .env.example to .env and run: npm run setup:env"
  );
}

export function getAuthUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

export function hasGoogleOAuth(): boolean {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(
    id &&
      secret &&
      id !== "your-google-client-id.apps.googleusercontent.com" &&
      secret !== "your-google-client-secret"
  );
}
