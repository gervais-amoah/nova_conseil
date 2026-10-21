// hooks/use-requests-params.ts
"use client";

import type { RequestStatus } from "@/lib/admin-requests";
import { isRequestStatus } from "@/lib/request-status";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useRequestsParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawStatus = searchParams.get("status");
  const status: RequestStatus | "all" = isRequestStatus(rawStatus)
    ? rawStatus
    : "all";
  const page = Math.max(1, Math.trunc(Number(searchParams.get("page"))) || 1);

  function update(next: { status?: RequestStatus | "all"; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.status !== undefined) {
      if (next.status === "all") params.delete("status");
      else params.set("status", next.status);
      params.delete("page"); // changing the filter resets pagination
    }

    if (next.page !== undefined) {
      if (next.page <= 1) params.delete("page");
      else params.set("page", String(next.page));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { status, page, update };
}
