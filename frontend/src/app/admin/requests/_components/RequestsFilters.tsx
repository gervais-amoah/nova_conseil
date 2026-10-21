// _components/RequestsFilters.tsx
import type { RequestStatus } from "@/lib/admin-requests";
import { STATUS_FILTERS } from "@/lib/request-status";

export function RequestsFilters({
  active,
  onChange,
}: {
  active: RequestStatus | "all";
  onChange: (value: RequestStatus | "all") => void;
}) {
  return (
    <section className="mt-8" aria-label="Request filters">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            aria-pressed={active === filter.value}
            className={[
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              active === filter.value
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-muted-foreground hover:bg-accent hover:text-foreground",
            ].join(" ")}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}