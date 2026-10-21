// _components/ListStates.tsx
import { LoaderCircle, RefreshCw } from "lucide-react";

export function LoadingState() {
  return (
    <div
      className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"
      role="status"
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      Loading requests…
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">
        Couldn&apos;t load requests
      </p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-gray-50"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

export function EmptyState({
  searching,
  onClearSearch,
}: {
  searching: boolean;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">
        {searching ? "No matching requests on this page" : "No requests found"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {searching
          ? "Try another search term or clear your search."
          : "Requests matching this filter will appear here."}
      </p>
      {searching && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
