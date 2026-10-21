import { formatConfidence } from "@/lib/request-status";
import type { RequestDetail } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { InfoCard, SectionHeading } from "./ui";

export function AiSuggestionCard({ req }: { req: RequestDetail }) {
  const hasSuggestion = Boolean(req.ai_category);
  const confidence = formatConfidence(req.ai_confidence);

  return (
    <InfoCard>
      <SectionHeading icon={Sparkles}>AI categorization</SectionHeading>

      <div className="mt-5">
        <p className="text-xs text-muted-foreground">Suggested department</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <span
              className="size-2 rounded-full bg-violet-600"
              aria-hidden="true"
            />
            {req.ai_category || "No suggestion"}
          </p>

          {hasSuggestion && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              AI suggestion
            </span>
          )}
        </div>
        {confidence && (
          <p className="ml-4 mt-2 text-xs text-muted-foreground">
            {confidence}
          </p>
        )}
        <div className="mt-5">
          <p className="text-xs font-medium text-foreground">
            Classification reasoning
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {req.ai_reasoning ? req.ai_reasoning : "No data"}

            {/* {hasSuggestion
              ? "Review the suggested department and confirm or change the final category below."
              : "An AI category is not available for this request yet."} */}
          </p>
        </div>
      </div>
    </InfoCard>
  );
}
