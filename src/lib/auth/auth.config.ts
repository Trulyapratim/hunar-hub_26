/**
 * Edge-compatible Auth.js configuration (no Prisma imports).
 *
 * Split from the main auth module so middleware can run on the Edge runtime.
 * Database adapter and Prisma-specific logic live in `@/lib/auth/index.ts`.
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getAuthSecret, getAuthUrl, hasGoogleOAuth } from "@/lib/env";

const googleProvider = hasGoogleOAuth()
  ? Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Request profile fields used for avatar and display name on first login.
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  : null;

export const authConfig = {
  secret: getAuthSecret(),
  providers: googleProvider ? [googleProvider] : [],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    /**
     * Runs on every authenticated request (including middleware).
     * `auth.user.onboardingComplete` is set in the session callback (database strategy).
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const pathname = nextUrl.pathname;

      const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/api/auth");

      if (isPublicRoute) {
        return true;
      }

      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
