"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Building2 } from "lucide-react";

const navigation = [
  {
    label: "Requests",
    href: "/admin/requests",
    icon: ClipboardList,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border bg-white">
      <div className="flex h-18 shrink-0 items-center border-b border-border px-6">
        <Link
          href="/admin/requests"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Novae Conseil
        </Link>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-5">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-primary"
                  : "text-muted-foreground hover:bg-gray-50 hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
            <Building2 className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              Staff account
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Administration
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
