export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const REQUEST_STATUSES = [
  "received",
  "classifying",
  "classified",
  "uncertain",
  "assigned",
  "resolved",
] as const;

export const REQUEST_CATEGORIES = [
  "Sales",
  "Support",
  "Operations",
  "Finance",
  "uncertain",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export interface AdminRequest {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  status: RequestStatus;
  ai_category: RequestCategory | null;
  final_category: RequestCategory | null;
  human_corrected_flag: boolean;
}

export interface PaginatedRequests {
  items: AdminRequest[];
  total: number;
  offset: number;
  limit: number;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export async function fetchAdminRequests({
  offset = 0,
  limit = 20,
  status,
  signal,
}: {
  offset?: number;
  limit?: number;
  status?: RequestStatus;
  signal?: AbortSignal;
} = {}): Promise<PaginatedRequests> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/api/v1/admin/requests?${params.toString()}`,
      {
        credentials: "include",
        cache: "no-store",
        signal,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new AdminApiError(
      "Unable to connect to the server. Check your connection and try again.",
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new AdminApiError(
      "Your session is no longer valid. Please sign in again.",
      response.status,
    );
  }

  if (!response.ok) {
    throw new AdminApiError(
      "We couldn't load the requests. Please try again.",
      response.status,
    );
  }

  try {
    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("items" in data) ||
      !Array.isArray(data.items) ||
      !("total" in data) ||
      typeof data.total !== "number" ||
      !("offset" in data) ||
      typeof data.offset !== "number" ||
      !("limit" in data) ||
      typeof data.limit !== "number"
    ) {
      throw new Error("Unexpected response shape");
    }

    return data as PaginatedRequests;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new AdminApiError(
      "The server returned an invalid requests response.",
    );
  }
}
