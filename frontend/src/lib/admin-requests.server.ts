// lib/admin-requests.server.ts
import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { RequestDetail } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getRequestDetail(id: string): Promise<RequestDetail> {
  if (!/^\d+$/.test(id)) notFound();

  const response = await fetch(`${API_URL}/api/v1/admin/requests/${id}`, {
    headers: { Cookie: (await cookies()).toString() },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) redirect("/login");
  if (response.status === 404) notFound();
  if (!response.ok)
    throw new Error(`Failed to load request (${response.status})`);

  return response.json();
}
