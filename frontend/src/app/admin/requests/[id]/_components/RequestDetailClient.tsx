// _components/RequestDetailClient.tsx
"use client";

import { useRequest } from "@/hooks/use-request";
import type { RequestDetail } from "@/lib/types";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { AiSuggestionCard } from "./AiSuggestionCard";
import { DecisionCard } from "./DecisionCard";
import {
  ClassificationDetailsCard,
  MessageCard,
  RequestInfoCard,
} from "./RequestSummaryCards";
import { StatusCard } from "./StatusCard";
import { InfoCard, SectionHeading } from "./ui";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default function RequestDetailClient({
  initialData,
}: {
  initialData: RequestDetail;
}) {
  const { data: req } = useRequest(initialData);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6">
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to requests
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {req.reference_id}
            </h1>
            <StatusBadge status={req.status} />
          </div>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_404px]">
          <div className="min-w-0 space-y-6">
            <RequestInfoCard req={req} />
            <MessageCard message={req.message} />
            <ClassificationDetailsCard req={req} />
          </div>

          <aside className="min-w-0 space-y-4">
            <AiSuggestionCard req={req} />
            <DecisionCard req={req} />
            <StatusCard req={req} />
            <InfoCard>
              <SectionHeading icon={Sparkles}>Next steps</SectionHeading>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Confirm that the final department reflects the request&apos;s
                actual needs. If the AI suggestion is incorrect, enter the
                appropriate department and save your decision.
              </p>
            </InfoCard>
          </aside>
        </div>
      </div>
    </main>
  );
}
