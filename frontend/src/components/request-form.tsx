// FILE: frontend/src/components/request-form.tsx
"use client";

import { ApiError, submitRequest } from "@/lib/api";
import { type SubmitEvent, useState } from "react";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; referenceId: string }
  | { kind: "error"; message: string };

export function RequestForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("hey!!!");
    setState({ kind: "submitting" });

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const created = await submitRequest(payload);
      setState({ kind: "success", referenceId: created.reference_id });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setState({
            kind: "error",
            message: "Too many requests — please wait a moment and try again.",
          });
        } else if (err.status === 422) {
          setState({
            kind: "error",
            message: "Please check the form fields and try again.",
          });
        } else {
          setState({
            kind: "error",
            message: "Something went wrong. Please try again.",
          });
        }
      } else {
        setState({
          kind: "error",
          message: "Network error. Please try again.",
        });
      }
    }
  }

  if (state.kind === "success") {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-6">
        <p className="text-lg font-semibold text-green-900">
          Thanks — we&apos;ve received your request.
        </p>
        <p className="mt-2 text-green-800">
          Your reference is{" "}
          <span className="font-mono font-semibold">{state.referenceId}</span>.
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-4 rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInvalidCapture={() => console.log("Invalid field")}
      className="flex w-full max-w-lg flex-col gap-4"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={320}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Message</span>
        <textarea
          name="message"
          required
          maxLength={5000}
          rows={5}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      {state.kind === "error" && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.kind === "submitting"}
        className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {state.kind === "submitting" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
