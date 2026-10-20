// FILE: frontend/src/app/admin/requests/page.tsx
"use client";

import { useEffect, useState } from "react";

interface RequestItem {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  status: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/requests`,
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => setRequests(data.items || []))
      .catch(console.error);
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Request Queue</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Reference ID</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="border p-2">
                <a
                  href={`/admin/requests/${req.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {req.reference_id}
                </a>
              </td>
              <td className="border p-2">{req.name}</td>
              <td className="border p-2">{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
