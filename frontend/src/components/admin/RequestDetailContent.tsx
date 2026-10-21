// FILE: frontend/src/app/components/admin/RequestDetailContent.tsx

import RequestDetailClient from "@/components/admin/RequestDetailClient";
import { RequestDetail } from "@/lib/types";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function RequestDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const cookieStore = await cookies();

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/api/v1/admin/requests/${encodeURIComponent(id)}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      },
    );
  } catch {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Unable to load request</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The server could not be reached. Please try again later.
        </p>
      </main>
    );
  }

  if (response.status === 401 || response.status === 403) {
    redirect("/login");
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Unable to load request</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The server returned an unexpected error. Please try again later.
        </p>
      </main>
    );
  }

  let request: RequestDetail;

  try {
    request = (await response.json()) as RequestDetail;
  } catch {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Invalid server response</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The request details could not be read.
        </p>
      </main>
    );
  }

  return <RequestDetailClient initialData={request} />;
}
