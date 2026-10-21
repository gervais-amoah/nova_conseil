"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class SessionError extends Error {
  constructor(public status: number) {
    super("Session check failed");
  }
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

async function checkSession() {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/auth/me`, {
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new SessionError(0);
  }
  if (!response.ok) throw new SessionError(response.status);
  return true;
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { error, isFetching, refetch } = useQuery({
    queryKey: ["admin-session"],
    queryFn: checkSession,
    retry: false,
    staleTime: 60_000,
  });

  const isAuthError = error instanceof SessionError && error.isAuthError;

  useEffect(() => {
    if (isAuthError) router.replace("/login");
  }, [isAuthError, router]);

  return (
    <>
      {error && !isAuthError && (
        <div
          role="alert"
          className="flex mx-5 items-center justify-end gap-3 border-b border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-800"
        >
          Unable to verify your session. The server could not be reached.
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 font-medium hover:underline disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Try again
          </button>
        </div>
      )}
      {children}
    </>
  );
}
