// error.tsx
"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Unable to load request</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The server could not be reached or returned an unexpected response.
      </p>
      <button
        onClick={reset}
        className="mt-4 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </main>
  );
}
