import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { hasGoogleOAuth } from "@/lib/env";
import { Sparkles, Users, MessageCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Sign in | HunarHub",
  description: "Sign in with Google to teach and learn skills with fellow students.",
};

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/onboarding";
  const googleConfigured = hasGoogleOAuth();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="size-8" />
              <span className="text-2xl font-bold">HunarHub</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Learn from peers.
              <br />
              Teach what you know.
            </h1>
            <p className="mt-4 max-w-md text-violet-100">
              A peer-to-peer skill-matching platform where students teach and learn from each other on campus.
            </p>
          </div>
          <ul className="space-y-4 text-sm text-violet-100">
            <li className="flex items-center gap-3">
              <Users className="size-5 shrink-0" />
              Match with students at your university
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="size-5 shrink-0" />
              Chat and request skill-exchange sessions
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm space-y-8 text-center">
            <div className="lg:hidden">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <Sparkles className="size-6" />
              </div>
              <h2 className="text-2xl font-bold">HunarHub</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Peer-to-peer skill matching for students
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Sign in to continue</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use your Google account to get started. First-time users complete a quick onboarding.
              </p>
            </div>

            {!googleConfigured ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-left text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="flex items-start gap-2 font-medium">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  Google sign-in is not configured
                </p>
                <p className="mt-2 text-xs opacity-90">
                  Add <code className="rounded bg-black/10 px-1">GOOGLE_CLIENT_ID</code>{" "}
                  and <code className="rounded bg-black/10 px-1">GOOGLE_CLIENT_SECRET</code>{" "}
                  to your <code className="rounded bg-black/10 px-1">.env</code> file.
                  Run <code className="rounded bg-black/10 px-1">npm run setup:env</code> if
                  you have not set up environment variables yet.
                </p>
              </div>
            ) : (
              <GoogleSignInButton callbackUrl={callbackUrl} className="w-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
