// FILE: frontend/src/app/admin/requests/[id]/RequestDetailClient.tsx

"use client";

import type { RequestStatus } from "@/lib/admin-requests";
import { API_URL, REQUEST_CATEGORIES } from "@/lib/admin-requests";
import { RequestDetail } from "@/lib/types";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  CircleUserRound,
  ClipboardCheck,
  LoaderCircle,
  MessageCircleText,
  Save,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type SyntheticEvent } from "react";

const STATUS_STYLES: Record<string, string> = {
  received: "bg-slate-100 text-slate-700",
  classifying: "bg-blue-50 text-blue-700",
  classified: "bg-indigo-50 text-indigo-700",
  uncertain: "bg-amber-50 text-amber-800",
  assigned: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {formatLabel(status)}
    </span>
  );
}

function SectionHeading({
  icon: Icon,
  children,
  trailing,
}: {
  icon: typeof Sparkles;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4.25 text-primary" aria-hidden="true" />
        {children}
      </h2>
      {trailing}
    </div>
  );
}

function InfoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-white p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function getNextStatus(status: string): RequestStatus | "" {
  if (status === "classified" || status === "uncertain") {
    return "assigned";
  }

  if (status === "assigned") {
    return "resolved";
  }

  return "";
}

export default function RequestDetailClient({
  initialData,
}: {
  initialData: RequestDetail;
}) {
  const router = useRouter();

  const [req, setReq] = useState(initialData);
  const [finalCategory, setFinalCategory] = useState(
    initialData.final_category ?? initialData.ai_category ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nextStatus, setNextStatus] = useState<RequestStatus | "">(
    getNextStatus(initialData.status),
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  function handleCategoryChange(
    event: ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
  ) {
    setFinalCategory(event.target.value);
    setError("");
    setSuccess("");
  }

  async function handleStatusSave() {
    if (!nextStatus || statusSaving) {
      return;
    }

    // Guard against stale or invalid UI state.
    if (getNextStatus(req.status) !== nextStatus) {
      setStatusError(
        "This status transition is no longer valid. Refresh the page.",
      );
      return;
    }

    setStatusSaving(true);
    setStatusError("");
    setStatusSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/requests/${req.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);

        const detail =
          typeof body === "object" &&
          body !== null &&
          "detail" in body &&
          typeof body.detail === "string"
            ? body.detail
            : null;

        setStatusError(
          detail ?? "We couldn't update the status. Please try again.",
        );
        return;
      }

      const updated: RequestDetail = await response.json();

      setReq(updated);
      setNextStatus(getNextStatus(updated.status));
      setStatusSuccess(`Request marked as ${updated.status}.`);
    } catch {
      setStatusError(
        "Unable to reach the server. Check your connection and try again.",
      );
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const category = finalCategory.trim();

    if (!category) {
      setError("Enter a department before saving.");
      return;
    }

    if (category.length > 50) {
      setError("The department must be 50 characters or fewer.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/requests/${req.id}/category`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ final_category: category }),
        },
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);

        const detail =
          typeof body === "object" &&
          body !== null &&
          "detail" in body &&
          typeof body.detail === "string"
            ? body.detail
            : null;

        setError(detail ?? "We couldn't save the category. Please try again.");
        return;
      }

      const updated: RequestDetail = await response.json();

      setReq(updated);
      setFinalCategory(updated.final_category ?? "");
      setSuccess("Department saved successfully.");
    } catch {
      setError(
        "Unable to reach the server. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const hasSuggestion = Boolean(req.ai_category);
  const confidence =
    req.ai_confidence !== null && Number.isFinite(req.ai_confidence)
      ? `${Math.round(
          req.ai_confidence <= 1 ? req.ai_confidence * 100 : req.ai_confidence,
        )}% confidence`
      : null;

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
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
          </div>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_404px]">
          <div className="min-w-0 space-y-6">
            <InfoCard>
              <SectionHeading icon={CircleUserRound}>
                Request information
              </SectionHeading>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="mt-2 wrap-break-word text-sm font-medium">
                    {req.name}
                  </p>
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

            <InfoCard>
              <SectionHeading icon={MessageCircleText}>
                Original message
              </SectionHeading>

              <div className="mt-5 rounded-lg border border-border bg-background p-4 sm:p-5">
                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-muted-foreground">
                  {req.message}
                </p>
              </div>
            </InfoCard>

            <InfoCard>
              <SectionHeading icon={ClipboardCheck}>
                Classification details
              </SectionHeading>

              <dl className="mt-4 divide-y divide-border">
                <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">
                    AI suggestion
                  </dt>
                  <dd className="text-sm font-medium">
                    {req.ai_category || "Not available"}
                  </dd>
                </div>

                <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">
                    Final department
                  </dt>
                  <dd className="text-sm font-medium">
                    {req.final_category || "Not assigned"}
                  </dd>
                </div>

                <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">
                    Classification confidence
                  </dt>
                  <dd className="text-sm">{confidence ?? "Not available"}</dd>
                </div>

                <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">
                    Classification source
                  </dt>
                  <dd className="wrap-break-word text-sm">
                    {req.classifier_source || "Not available"}
                  </dd>
                </div>

                <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">
                    Human correction
                  </dt>
                  <dd className="flex items-center gap-2 text-sm">
                    {req.human_corrected_flag ? (
                      <>
                        <Check
                          className="size-4 text-emerald-600"
                          aria-hidden="true"
                        />
                        Corrected
                      </>
                    ) : (
                      "No correction recorded"
                    )}
                  </dd>
                </div>
              </dl>
            </InfoCard>
          </div>

          <aside className="min-w-0 space-y-4">
            <InfoCard>
              <SectionHeading icon={Sparkles}>AI categorization</SectionHeading>

              <div className="mt-5">
                <p className="text-xs text-muted-foreground">
                  Suggested department
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="size-2 rounded-full bg-violet-600" />
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
                    Classification status
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {req.ai_category
                      ? "Review the suggested department and confirm or change the final category below."
                      : "An AI category is not available for this request yet."}
                  </p>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <SectionHeading icon={CircleUserRound}>
                Your decision
              </SectionHeading>

              <form
                id="decision-form"
                onSubmit={handleSave}
                className="mt-5 space-y-4"
              >
                <div>
                  <label
                    htmlFor="final-category"
                    className="mb-2 block text-xs font-medium text-muted-foreground"
                  >
                    Final department
                  </label>
                  <select
                    id="final-category"
                    name="final_category"
                    required
                    value={finalCategory}
                    onChange={(e) => handleCategoryChange(e)}
                    className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <option value="" disabled>
                      Select department
                    </option>
                    {REQUEST_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Choose the appropriate department category.
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 text-sm text-red-600"
                  >
                    <CircleAlert
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {error}
                  </p>
                )}

                {success && (
                  <p
                    role="status"
                    className="flex items-start gap-2 text-sm text-emerald-700"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving || !finalCategory}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
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

            <InfoCard>
              <SectionHeading icon={ClipboardCheck}>
                Request status
              </SectionHeading>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Current status</p>
                <div className="mt-2">
                  <StatusBadge status={req.status} />
                </div>
              </div>

              {nextStatus ? (
                <div className="mt-5">
                  <label
                    htmlFor="next-status"
                    className="mb-2 block text-xs font-medium text-muted-foreground"
                  >
                    Move to
                  </label>

                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Next status</p>
                    <p className="mt-1 text-sm font-semibold">
                      {nextStatus === "assigned" ? "Assigned" : "Resolved"}
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {nextStatus === "assigned"
                      ? "The request is ready for the responsible team. This does not assign a specific staff member."
                      : "Mark this request as resolved when its work is complete."}
                  </p>

                  {statusError && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                      {statusError}
                    </p>
                  )}

                  {statusSuccess && (
                    <p role="status" className="mt-3 text-sm text-emerald-700">
                      {statusSuccess}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleStatusSave()}
                    disabled={statusSaving || !nextStatus}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {statusSaving ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                    {statusSaving ? "Updating…" : "Update status"}
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {req.status === "resolved"
                    ? "This request has been resolved. No further status transitions are available."
                    : "This status is managed automatically by the classification workflow."}
                </p>
              )}
            </InfoCard>

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
