/**
 * Public landing page for HunarHub.
 */
import Link from "next/link";
import { Sparkles, ArrowRight, GraduationCap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-background to-indigo-50/30 dark:from-violet-950/30">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-violet-700">
          <Sparkles className="size-6" />
          HunarHub
        </Link>
        <Link
          href="/sign-in"
          className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-sm font-medium text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
            <GraduationCap className="size-4" />
            Peer-to-peer learning on campus
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Teach what you know.
            <span className="block bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Learn what you need.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            HunarHub matches students who can teach a skill with peers who want to learn it — same university, real connections.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GoogleSignInButton callbackUrl="/onboarding" />
            <Link
              href="/sign-in"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-6 text-sm font-medium shadow-xs hover:bg-muted"
            >
              Learn more
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "Campus-first",
              desc: "Match with students at your university for trusted peer learning.",
            },
            {
              icon: Handshake,
              title: "Skill exchange",
              desc: "Tag what you can teach and what you want to learn in one profile.",
            },
            {
              icon: Sparkles,
              title: "Built for students",
              desc: "Simple onboarding with Google — start matching in minutes.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <Icon className="mb-3 size-8 text-violet-600" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
