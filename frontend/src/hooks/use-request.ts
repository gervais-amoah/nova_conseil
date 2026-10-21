// hooks/use-request.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ApiError,
  fetchRequest,
  patchCategory,
  patchStatus,
} from "@/lib/admin-requests-api";
import type { RequestDetail } from "@/lib/types";

const requestKey = (id: number) => ["admin-request", id] as const;

export function useRequest(initialData: RequestDetail) {
  return useQuery({
    queryKey: requestKey(initialData.id),
    queryFn: () => fetchRequest(initialData.id),
    initialData,
  });
}

function useRequestMutation<TVars>(
  id: number,
  mutationFn: (vars: TVars) => Promise<RequestDetail>,
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<RequestDetail, ApiError, TVars>({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKey(id), updated);
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] }); // list, if client-fetched
      router.refresh(); // list, if server-rendered
    },
    onError: (error) => {
      if (error.isAuthError) router.replace("/login");
    },
  });
}

export const useUpdateCategory = (id: number) =>
  useRequestMutation(id, (category: string) => patchCategory(id, category));

export const useUpdateStatus = (id: number) =>
  useRequestMutation(id, (status: string) => patchStatus(id, status));
