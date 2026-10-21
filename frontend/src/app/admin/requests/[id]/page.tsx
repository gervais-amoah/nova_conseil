// page.tsx
import { getRequestDetail } from "@/lib/admin-requests.server";
import { Suspense } from "react";
import RequestDetailClient from "./_components/RequestDetailClient";

type Props = { params: Promise<{ id: string }> };

async function RequestDetailContent({ params }: Props) {
  const { id } = await params;
  const request = await getRequestDetail(id);
  return <RequestDetailClient initialData={request} />;
}

export default function RequestDetailPage({ params }: Props) {
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
