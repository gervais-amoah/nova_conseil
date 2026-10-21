// _components/RequestsList.tsx
"use client";

import {
  isAuthError,
  PAGE_SIZE,
  useRequestsList,
} from "@/hooks/use-requests-list";
import { useRequestsParams } from "@/hooks/use-requests-params";
import { STATUS_CONFIG } from "@/lib/request-status";
import { ArrowDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "./ListStates";
import { RequestsFilters } from "./RequestsFilters";
import { RequestsPagination } from "./RequestsPagination";
import { RequestsTable } from "./RequestsTable";

export default function RequestsList() {
  const router = useRouter();
  const { status, page, update } = useRequestsParams();
  const [search, setSearch] = useState("");

  const { data, error, isPending, isPlaceholderData, refetch } =
    useRequestsList({ status, page });

  useEffect(() => {
    if (isAuthError(error)) router.replace("/login");
  }, [error, router]);

  const requests = data?.items ?? [];
  const total = data?.total ?? 0;

  const query = search.trim().toLowerCase();
  const visible = query
    ? requests.filter((r) =>
        [r.reference_id, r.name, r.email, r.ai_category, r.final_category].some(
          (value) => (value ?? "").toLowerCase().includes(query),
        ),
      )
    : requests;

  function changeStatus(next: typeof status) {
    setSearch("");
    update({ status: next });
  }

  return (
    <main className="min-h-screen min-w-0 px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review incoming requests and their AI classifications. Check
              uncertain results and compare the suggested category with the
              final classification.
            </p>
          </div>

          <label className="relative block w-full xl:w-77.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this page..."
              aria-label="Search requests on this page"
              className="h-10 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </label>
        </header>

        <RequestsFilters active={status} onChange={changeStatus} />

        <section
          className="mt-5 overflow-hidden rounded-xl border border-border bg-white"
          aria-label="Requests list"
        >
          <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {status === "all" ? "All requests" : STATUS_CONFIG[status].label}
            </p>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "request" : "requests"} total
            </p>
          </div>

          {error && !data ? (
            <ErrorState
              message={error.message}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState />
          ) : (
            <>
              {visible.length === 0 ? (
                <EmptyState
                  searching={Boolean(query)}
                  onClearSearch={() => setSearch("")}
                />
              ) : (
                <div
                  className={
                    isPlaceholderData
                      ? "opacity-60 transition-opacity"
                      : undefined
                  }
                >
                  <RequestsTable requests={visible} />
                </div>
              )}

              {total > 0 && (
                <RequestsPagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  shown={visible.length}
                  loaded={requests.length}
                  disabled={isPlaceholderData}
                  onPageChange={(next) => update({ page: next })}
                />
              )}
            </>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          <ArrowDown className="mr-1 inline size-3" aria-hidden="true" />
          Requests are ordered newest first by the server. Search currently
          applies only to the loaded page.
        </p>
      </div>
    </main>
  );
}
