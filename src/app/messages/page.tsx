/**
 * /messages — WhatsApp-style split-screen messaging for skill requests & chat.
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { MessagesApp } from "@/components/messages/messages-app";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Messages",
  description: "Chat with peers and manage skill exchange requests.",
};

function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-57px)]">
      <Skeleton className="h-full w-80 shrink-0 rounded-none" />
      <Skeleton className="hidden h-full flex-1 md:block" />
    </div>
  );
}

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/messages");
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activePath="/messages" />

      <Suspense fallback={<MessagesLoading />}>
        <MessagesApp />
      </Suspense>
    </div>
  );
}
