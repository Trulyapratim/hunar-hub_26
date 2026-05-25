/**
 * HunarHub authentication entry point (Auth.js / NextAuth v5).
 *
 * Flow:
 * 1. User clicks "Continue with Google" → OAuth redirect.
 * 2. PrismaAdapter creates/links User + Account rows on first sign-in.
 * 3. `events.createUser` copies OAuth profile image into `avatar`.
 * 4. JWT + session callbacks expose `onboardingComplete` (from `university` in DB).
 * 5. Edge middleware (`@/lib/auth/edge`) reads the JWT without Prisma.
 */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/auth.config";
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Persists DB user fields into the JWT so Edge middleware can read them
     * without calling Prisma.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      const userId = (token.id as string) ?? token.sub;
      if (userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { university: true },
          });
          token.university = dbUser?.university ?? null;
          token.onboardingComplete = Boolean(dbUser?.university);
        } catch (err) {
          console.error("[auth-jwt-callback] Error fetching user from DB:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.university = (token.university as string | null) ?? null;
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: user.image },
        });
      }
    },
  },
});
