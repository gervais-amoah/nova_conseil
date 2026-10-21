"use client";

import {
  AdminApiError,
  fetchAdminRequests,
  type AdminRequest,
  type RequestStatus,
} from "@/lib/admin-requests";
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

const PAGE_SIZE = 20;

const FILTERS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All requests", value: "all" },
  { label: "Received", value: "received" },
  { label: "Classifying", value: "classifying" },
  { label: "Classified", value: "classified" },
  { label: "Assigned", value: "assigned" },
  { label: "Resolved", value: "resolved" },
];

const STATUS_STYLES: Record<RequestStatus, string> = {
  received: "bg-slate-100 text-slate-700",
  classifying: "bg-blue-50 text-blue-700",
  classified: "bg-indigo-50 text-indigo-700",
  assigned: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  received: "Received",
  classifying: "Classifying",
  classified: "Classified",
  assigned: "Assigned",
  resolved: "Resolved",
};

function Category({
  value,
  corrected = false,
}: {
  value: string | null;
  corrected?: boolean;
}) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="max-w-[180px] truncate">{value}</span>
      {corrected && (
        <span
          title="Human-corrected classification"
          className="size-1.5 shrink-0 rounded-full bg-amber-500"
        />
      )}
    </span>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<RequestStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError("");

      try {
        const result = await fetchAdminRequests({
          offset,
          limit: PAGE_SIZE,
          status: status === "all" ? undefined : status,
          signal,
        });

        setRequests(result.items);
        setTotal(result.total);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (
          err instanceof AdminApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          router.replace("/login");
          return;
        }

        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [offset, status, router],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadRequests(controller.signal); // <- Error: Calling setState synchronously within an effect can trigger cascading renders

    return () => controller.abort();
  }, [loadRequests]);

  function handleStatusChange(value: RequestStatus | "all") {
    setStatus(value);
    setOffset(0);
    setSearch("");
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredRequests = requests.filter((request) =>
    [
      request.reference_id,
      request.name,
      request.email,
      request.ai_category ?? "",
      request.final_category ?? "",
    ].some((value) => value.toLowerCase().includes(normalizedSearch)),
  );

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);
  const hasPreviousPage = offset > 0;
  const hasNextPage = offset + PAGE_SIZE < total;

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

          <label className="relative block w-full xl:w-[310px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search this page..."
              aria-label="Search requests on this page"
              className="h-10 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </label>
        </header>

        <section className="mt-8" aria-label="Request filters">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => {
              const active = status === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleStatusChange(filter.value)}
                  aria-pressed={active}
                  className={[
                    "rounded-full px-4 py-2 text-xs font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="mt-5 overflow-hidden rounded-xl border border-border bg-white"
          aria-label="Requests list"
        >
          <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {status === "all" ? "All requests" : STATUS_LABELS[status]}
            </p>

            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "request" : "requests"} total
            </p>
          </div>

          {error ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                Couldn&apos;t load requests
              </p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  const controller = new AbortController();
                  void loadRequests(controller.signal);
                }}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-gray-50"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div
              className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"
              role="status"
            >
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
              Loading requests…
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                {normalizedSearch
                  ? "No matching requests on this page"
                  : "No requests found"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {normalizedSearch
                  ? "Try another search term or clear your search."
                  : "Requests matching this filter will appear here."}
              </p>
              {normalizedSearch && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/70 text-xs text-muted-foreground">
                      <th scope="col" className="px-5 py-3.5 font-medium">
                        Request
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-medium">
                        AI suggestion
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-medium">
                        Final category
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-medium">
                        Status
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="transition-colors hover:bg-gray-50/70"
                      >
                        <td className="max-w-[360px] px-5 py-4">
                          <p className="font-medium text-foreground">
                            {request.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.reference_id}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {request.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          <Category value={request.ai_category} />
                        </td>

                        <td className="px-5 py-4 text-sm">
                          <Category
                            value={request.final_category}
                            corrected={request.human_corrected_flag}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={request.status} />
                        </td>

                        <td className="px-5 py-4">
                          <a
                            href={`/admin/requests/${request.id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            View
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {filteredRequests.length} of {requests.length} on this
                  page · {pageStart}–{pageEnd} of {total} total
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!hasPreviousPage || isLoading}
                    onClick={() =>
                      setOffset((current) => Math.max(0, current - PAGE_SIZE))
                    }
                    aria-label="Previous page"
                    className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>

                  <span className="min-w-16 text-center text-xs text-muted-foreground">
                    Page {Math.floor(offset / PAGE_SIZE) + 1} of{" "}
                    {Math.max(1, Math.ceil(total / PAGE_SIZE))}
                  </span>

                  <button
                    type="button"
                    disabled={!hasNextPage || isLoading}
                    onClick={() => setOffset((current) => current + PAGE_SIZE)}
                    aria-label="Next page"
                    className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </footer>
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
