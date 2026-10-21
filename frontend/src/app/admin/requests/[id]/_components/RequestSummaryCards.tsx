// _components/RequestSummaryCards.tsx
import { formatConfidence } from "@/lib/request-status";
import type { RequestDetail } from "@/lib/types";
import {
  Check,
  CheckCircle2,
  CircleUserRound,
  ClipboardCheck,
  MessageCircleText,
} from "lucide-react";
import { DetailRow } from "./DetailRow";
import { InfoCard, SectionHeading } from "./ui";

export function RequestInfoCard({ req }: { req: RequestDetail }) {
  return (
    <InfoCard>
      <SectionHeading icon={CircleUserRound}>
        Request information
      </SectionHeading>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">From</p>
          <p className="mt-2 wrap-break-word text-sm font-medium">{req.name}</p>
          <a
            href={`mailto:${req.email}`}
            className="mt-1 inline-block  break-all text-xs text-primary hover:underline"
          >
            {req.email}
          </a>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Reference ID</p>
          <p className="mt-2 break-all text-sm font-medium">
            {req.reference_id}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Request #{req.id}
          </p>
        </div>
      </div>
    </InfoCard>
  );
}

export function MessageCard({ message }: { message: string }) {
  return (
    <InfoCard>
      <SectionHeading icon={MessageCircleText}>Original message</SectionHeading>
      <div className="mt-5 rounded-lg border border-border bg-background p-4 sm:p-5">
        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-muted-foreground">
          {message}
        </p>
      </div>
    </InfoCard>
  );
}

export function ClassificationDetailsCard({ req }: { req: RequestDetail }) {
  return (
    <InfoCard>
      <SectionHeading icon={ClipboardCheck}>
        Classification details
      </SectionHeading>
      <dl className="mt-4 divide-y divide-border">
        <DetailRow label="AI suggestion">
          {req.ai_category || "Not available"}
        </DetailRow>
        <DetailRow label="Final department">
          {req.final_category || "Not assigned"}
        </DetailRow>
        <DetailRow label="Initial source">
          {req.classifier_source || "Not available"}
        </DetailRow>
        <DetailRow label="Human correction">
          {req.human_corrected_flag ? (
            <span className="flex items-center gap-2">
              Corrected
              <CheckCircle2
                className="size-4 text-emerald-600"
                aria-hidden="true"
              />
            </span>
          ) : (
            "No correction recorded"
          )}
        </DetailRow>
      </dl>
    </InfoCard>
  );
}
