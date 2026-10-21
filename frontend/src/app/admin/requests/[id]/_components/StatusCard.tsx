// _components/StatusCard.tsx
"use client";

import { useUpdateStatus } from "@/hooks/use-request";
import { getNextStatus } from "@/lib/request-status";
import type { RequestDetail } from "@/lib/types";
import { Check, ClipboardCheck, LoaderCircle } from "lucide-react";
import { InfoCard, SectionHeading } from "./ui";
import { StatusBadge } from "@/components/admin/StatusBadge";

const TRANSITION_COPY = {
  assigned: {
    label: "Assigned",
    hint: "The request is ready for the responsible team. This does not assign a specific staff member.",
  },
  resolved: {
    label: "Resolved",
    hint: "Mark this request as resolved when its work is complete.",
  },
  received: {
    label: "Resolved",
    hint: "Mark this request as resolved when its work is complete.",
  },
  classifying: {
    label: "Resolved",
    hint: "Mark this request as resolved when its work is complete.",
  },
  classified: {
    label: "Resolved",
    hint: "Mark this request as resolved when its work is complete.",
  },
  uncertain: {
    label: "Resolved",
    hint: "Mark this request as resolved when its work is complete.",
  },
} as const;

export function StatusCard({ req }: { req: RequestDetail }) {
  const next = getNextStatus(req.status); // derived on every render, never stale
  const mutation = useUpdateStatus(req.id);

  return (
    <InfoCard>
      <SectionHeading icon={ClipboardCheck}>Request status</SectionHeading>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Current status</p>
        <div className="mt-2">
          <StatusBadge status={req.status} />
        </div>
      </div>

      {next ? (
        <div className="mt-5">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Next status</p>
            <p className="mt-1 text-sm font-semibold">
              {TRANSITION_COPY[next].label}
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {TRANSITION_COPY[next].hint}
          </p>

          <button
            type="button"
            onClick={() => mutation.mutate(next)}
            disabled={mutation.isPending}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            {mutation.isPending ? "Updating…" : "Update status"}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {req.status === "resolved"
            ? "This request has been resolved. No further status transitions are available."
            : "This status is managed automatically by the classification workflow."}
        </p>
      )}

      {mutation.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {mutation.error.message}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          Request marked as {mutation.data.status}.
        </p>
      )}
    </InfoCard>
  );
}
