// FILE: frontend/src/app/admin/requests/[id]/RequestDetailClient.tsx
"use client";

import { useState } from "react";

interface RequestDetail {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  ai_category: string | null;
  final_category: string | null;
  human_corrected_flag: boolean;
}

export default function RequestDetailClient({
  initialData,
}: {
  initialData: RequestDetail;
}) {
  const [req, setReq] = useState<RequestDetail>(initialData);
  const [finalCategory, setFinalCategory] = useState(
    initialData.final_category || "",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(
      `${apiUrl}/api/v1/admin/requests/${req.id}/category`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ final_category: finalCategory }),
      },
    );

    if (res.ok) {
      const updated = await res.json();
      setReq(updated);
    } else {
      alert("Failed to save");
    }
    setSaving(false);
  };

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Request: {req.reference_id}</h1>

      <div className="space-y-2 border p-4 rounded bg-gray-50">
        <p>
          <strong>Name:</strong> {req.name}
        </p>
        <p>
          <strong>Email:</strong> {req.email}
        </p>
        <p>
          <strong>Message:</strong> {req.message}
        </p>
        <p>
          <strong>AI Category:</strong> {req.ai_category || "None"}
        </p>
        <p>
          <strong>Final Category:</strong>{" "}
          <span data-testid="final-category">
            {req.final_category || "None"}
          </span>
        </p>
        <p>
          <strong>Human Corrected:</strong>{" "}
          <span data-testid="human-corrected">
            {req.human_corrected_flag ? "Yes" : "No"}
          </span>
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 border p-4 rounded">
        <h2 className="text-lg font-semibold">Override Category</h2>
        <div>
          <label htmlFor="final_category" className="block text-sm font-medium">
            Final Category
          </label>
          <input
            id="final_category"
            type="text"
            value={finalCategory}
            onChange={(e) => setFinalCategory(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </main>
  );
}
