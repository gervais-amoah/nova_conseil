// lib/admin-requests-api.ts
import { API_URL } from "@/lib/admin-requests";
import type { RequestDetail } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

async function call<T>(
  path: string,
  init: RequestInit,
  fallback: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/admin${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: unknown;
    } | null;
    throw new ApiError(
      response.status,
      typeof body?.detail === "string" ? body.detail : fallback,
    );
  }
  return response.json();
}

export const fetchRequest = (id: number) =>
  call<RequestDetail>(`/requests/${id}`, {}, "We couldn't load the request.");

export const patchCategory = (id: number, final_category: string) =>
  call<RequestDetail>(
    `/requests/${id}/category`,
    { method: "PATCH", body: JSON.stringify({ final_category }) },
    "We couldn't save the category. Please try again.",
  );

export const patchStatus = (id: number, status: string) =>
  call<RequestDetail>(
    `/requests/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    "We couldn't update the status. Please try again.",
  );
