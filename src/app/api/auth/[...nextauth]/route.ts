/**
 * Auth.js catch-all route handler.
 * Handles OAuth callbacks, session cookies, and sign-out.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
