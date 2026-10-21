// FILE: frontend/src/app/admin/requests/[id]/page.tsx

import { RequestDetailContent } from "@/components/admin/RequestDetailContent";
import { Suspense } from "react";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="p-8 text-sm text-muted-foreground">
          Loading request details…
        </main>
      }
    >
      <RequestDetailContent params={params} />
    </Suspense>
  );
}
