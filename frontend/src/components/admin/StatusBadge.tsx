// components/admin/StatusBadge.tsx
import { STATUS_CONFIG } from "@/lib/request-status";

export function StatusBadge({
  status,
  dot = false,
}: {
  status: string;
  dot?: boolean;
}) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        config?.className ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {dot && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
      {config?.label ?? status}
    </span>
  );
}
