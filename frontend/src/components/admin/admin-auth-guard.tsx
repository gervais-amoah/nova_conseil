"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type AuthState = "checking" | "authenticated" | "unavailable";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>("checking");

  const checkSession = useCallback(async () => {
    setState("checking");

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setState("unavailable");
        return;
      }

      setState("authenticated");
    } catch {
      setState("unavailable");
    }
  }, [router]);

  useEffect(() => {
    void checkSession(); // <- Error here: Calling setState synchronously within an effect can trigger cascading renders
  }, [checkSession]);

  if (state === "checking") {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-background"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          Verifying your session…
        </div>
      </main>
    );
  }

  if (state === "unavailable") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className="w-full max-w-sm rounded-xl border border-border bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Unable to verify your session
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The server could not be reached or returned an unexpected response.
            Please try again.
          </p>
          <button
            type="button"
            onClick={() => void checkSession()}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </section>
      </main>
    );
  }

  return children;
}
