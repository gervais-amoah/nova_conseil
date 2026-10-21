// lib/request-status.ts
import type { RequestStatus } from "@/lib/admin-requests";

const NEXT_STATUS: Partial<Record<string, RequestStatus>> = {
  classified: "assigned",
  uncertain: "assigned",
  assigned: "resolved",
};

export const getNextStatus = (status: string) => NEXT_STATUS[status] ?? null;

export function formatConfidence(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  return `${Math.round(value <= 1 ? value * 100 : value)}% confidence`;
}

export const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  received: { label: "Received", className: "bg-slate-100 text-slate-700" },
  classifying: { label: "Classifying", className: "bg-blue-50 text-blue-700" },
  classified: {
    label: "Classified",
    className: "bg-indigo-50 text-indigo-700",
  },
  uncertain: { label: "Pending", className: "bg-amber-50 text-amber-800" },
  assigned: { label: "Assigned", className: "bg-violet-50 text-violet-700" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-700" },
};

export function isRequestStatus(value: string | null): value is RequestStatus {
  return value !== null && Object.hasOwn(STATUS_CONFIG, value);
}

export const STATUS_FILTERS = [
  { label: "All requests", value: "all" },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
    label,
    value: value as RequestStatus,
  })),
] as const;
