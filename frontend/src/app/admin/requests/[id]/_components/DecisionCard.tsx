// _components/DecisionCard.tsx
"use client";

import { REQUEST_CATEGORIES } from "@/lib/admin-requests";
import { useUpdateCategory } from "@/hooks/use-request";
import type { RequestDetail } from "@/lib/types";
import {
  Check,
  CircleAlert,
  CircleUserRound,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import { InfoCard, SectionHeading } from "./ui";

export function DecisionCard({ req }: { req: RequestDetail }) {
  const [category, setCategory] = useState(
    req.final_category ?? req.ai_category ?? "",
  );
  const mutation = useUpdateCategory(req.id);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (category) mutation.mutate(category);
  }

  return (
    <InfoCard>
      <SectionHeading icon={CircleUserRound}>Your decision</SectionHeading>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="final-category"
            className="mb-2 block text-xs font-medium text-muted-foreground"
          >
            Final department
          </label>
          <select
            id="final-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              mutation.reset();
            }}
            className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="" disabled>
              Select department
            </option>
            {REQUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Choose the appropriate department category.
          </p>
        </div>

        {mutation.error && (
          <p
            role="alert"
            className="flex items-start gap-2 text-sm text-red-600"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {mutation.error.message}
          </p>
        )}

        {mutation.isSuccess && (
          <p
            role="status"
            className="flex items-start gap-2 text-sm text-emerald-700"
          >
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Department saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !category}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? (
            <>
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden="true" />
              Save decision
            </>
          )}
        </button>
      </form>
    </InfoCard>
  );
}
