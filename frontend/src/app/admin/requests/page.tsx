// page.tsx
import { Suspense } from "react";
import RequestsList from "./_components/RequestsList";

export default function AdminRequestsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8 text-sm text-muted-foreground">
          Loading requests…
        </main>
      }
    >
      <RequestsList />
    </Suspense>
  );
}
