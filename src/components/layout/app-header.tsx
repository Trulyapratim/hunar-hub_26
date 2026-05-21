import Link from "next/link";
import { Sparkles } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  activePath?: "/browse" | "/dashboard" | "/messages";
};

export async function AppHeader({ activePath = "/browse" }: AppHeaderProps) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/browse"
          className="flex items-center gap-2 font-bold text-violet-700 dark:text-violet-400"
        >
          <Sparkles className="size-6" />
          HunarHub
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/browse" active={activePath === "/browse"}>
            Browse
          </NavLink>
          <NavLink href="/messages" active={activePath === "/messages"}>
            Messages
          </NavLink>
          <NavLink href="/dashboard" active={activePath === "/dashboard"}>
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user?.name && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name.split(" ")[0]}
            </span>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
