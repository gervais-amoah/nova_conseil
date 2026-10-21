// hooks/use-requests-list.ts
"use client";

import {
  AdminApiError,
  fetchAdminRequests,
  type RequestStatus,
} from "@/lib/admin-requests";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const PAGE_SIZE = 20;

export const isAuthError = (error: unknown) =>
  error instanceof AdminApiError &&
  (error.status === 401 || error.status === 403);

export function useRequestsList({
  status,
  page,
}: {
  status: RequestStatus | "all";
  page: number;
}) {
  return useQuery({
    queryKey: ["admin-requests", { status, page }],
    queryFn: ({ signal }) =>
      fetchAdminRequests({
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        status: status === "all" ? undefined : status,
        signal,
      }),
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,

    // --- ADD THIS LINE FOR SIMPLE POLLING ---
    refetchInterval: 1000 * 10, // Refetches every 1 (1000ms)  * X seconds
    refetchOnWindowFocus: true, // Also refetches if you tab back into the admin window
  });
}
