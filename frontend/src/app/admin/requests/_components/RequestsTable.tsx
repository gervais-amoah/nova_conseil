// _components/RequestsTable.tsx
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminRequest } from "@/lib/admin-requests";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryCell } from "./CategoryCell";

const COLUMNS = [
  "Request",
  "AI suggestion",
  "Final category",
  "Status",
  "Actions",
];

export function RequestsTable({ requests }: { requests: AdminRequest[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-225 border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-gray-50/70 text-xs text-muted-foreground">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-5 py-3.5 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {requests.map((request) => (
            <tr
              key={request.id}
              className="transition-colors hover:bg-gray-50/70"
            >
              <td className="max-w-90 px-5 py-4">
                <p className="font-medium text-foreground">{request.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {request.reference_id}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {request.email}
                </p>
              </td>
              <td className="px-5 py-4 text-sm">
                <CategoryCell value={request.ai_category} />
              </td>
              <td className="px-5 py-4 text-sm">
                <CategoryCell
                  value={request.final_category}
                  corrected={request.human_corrected_flag}
                />
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/admin/requests/${request.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  View
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
