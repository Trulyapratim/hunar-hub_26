/**
 * Edge-safe Auth.js instance for middleware only.
 *
 * Does NOT import Prisma (Edge runtime cannot run the DB client).
 * Reads the same JWT session cookie written by `@/lib/auth` after Google sign-in.
 */
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export const { auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
        session.user.university = (token.university as string | null) ?? null;
      }
      return session;
    },
  },
});
