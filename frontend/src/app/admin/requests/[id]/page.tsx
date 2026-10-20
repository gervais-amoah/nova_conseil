// FILE: frontend/src/app/admin/requests/[id]/page.tsx
import { Suspense } from "react";

import RequestDetailClient from "@/components/RequestDetailClient";
import { cookies } from "next/headers";

async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Read the user's session cookie from the incoming browser request
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let req = null;
  try {
    // 2. Forward the cookie to the backend so the API recognizes the authenticated user
    const res = await fetch(`${apiUrl}/api/v1/admin/requests/${id}`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (res.ok) {
      req = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch request", e);
  }

  if (!req) {
    return (
      <main className="p-8 text-red-500">
        Request not found or unauthorized.
      </main>
    );
  }

  // 3. Pass the fetched data to the Client Component for interactivity
  return <RequestDetailClient initialData={req} />;
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <RequestDetail params={params} />
    </Suspense>
  );
}
