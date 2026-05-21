"use client";

/**
 * Wraps the app with NextAuth SessionProvider for client-side hooks
 * (`useSession`, `signIn`, `signOut`).
 */
import { SessionProvider } from "next-auth/react";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
