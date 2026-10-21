"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getErrorMessage(body: unknown): string {
  if (typeof body !== "object" || body === null) {
    return "Unable to sign in. Please check your credentials.";
  }

  const detail = "detail" in body ? body.detail : undefined;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (
    Array.isArray(detail) &&
    detail.length > 0 &&
    typeof detail[0] === "object" &&
    detail[0] !== null &&
    "msg" in detail[0] &&
    typeof detail[0].msg === "string"
  ) {
    return detail[0].msg;
  }

  return "Unable to sign in. Please check your credentials.";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);

        setError(getErrorMessage(body));
        return;
      }

      router.replace("/admin/");
      router.refresh();
    } catch {
      setError(
        "Unable to reach the server. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm sm:p-10">
        <header className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-8 ">
            <Logo showName={false} />
            <p className="text-xl font-semibold tracking-tight">
              Novae Conseil
            </p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to manage incoming requests.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          Authorized staff only.
        </p>
      </section>
    </main>
  );
}
