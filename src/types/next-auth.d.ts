/**
 * Module augmentation for Auth.js session and JWT types.
 */
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      university: string | null;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    university?: string | null;
    onboardingComplete?: boolean;
  }
}
