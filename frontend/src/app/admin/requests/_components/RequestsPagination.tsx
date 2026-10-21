// _components/RequestsPagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

const buttonClass =
  "flex size-9 items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

export function RequestsPagination({
  page,
  pageSize,
  total,
  shown,
  loaded,
  disabled,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  shown: number;
  loaded: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {shown} of {loaded} on this page · {start}–{end} of {total}{" "}
        total
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || disabled}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className={buttonClass}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        <span className="min-w-16 text-center text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className={buttonClass}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
