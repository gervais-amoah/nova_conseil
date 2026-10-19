// FILE: frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface RequestCreate {
  name: string;
  email: string;
  message: string;
}

export interface RequestCreated {
  reference_id: string;
  status: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

export async function submitRequest(
  payload: RequestCreate,
): Promise<RequestCreated> {
  const res = await fetch(`${API_URL}/api/v1/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<RequestCreated>;
}
