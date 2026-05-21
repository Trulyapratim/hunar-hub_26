/**
 * Route protection and onboarding redirect middleware.
 *
 * Rules:
 * - Unauthenticated users on protected routes → /sign-in
 * - Authenticated users without `university` → /onboarding (first-time flow)
 * - Onboarded users visiting /onboarding → /browse
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/edge";

const PROTECTED_PREFIXES = [
  "/browse",
  "/dashboard",
  "/messages",
  "/onboarding",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user);
  const onboardingComplete = session?.user?.onboardingComplete ?? false;

  const isAuthRoute = pathname.startsWith("/sign-in");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicHome = pathname === "/";
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (isProtected) {
      const signInUrl = new URL("/sign-in", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  if (!onboardingComplete && !isOnboardingRoute) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }

  if (onboardingComplete && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/browse", req.nextUrl.origin));
  }

  if (isLoggedIn && isAuthRoute) {
    const destination = onboardingComplete ? "/browse" : "/onboarding";
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  if (isLoggedIn && isPublicHome) {
    const destination = onboardingComplete ? "/browse" : "/onboarding";
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
