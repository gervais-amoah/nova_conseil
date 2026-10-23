"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogOut } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function SidebarUserFooter({ isCollapsed }: { isCollapsed?: boolean }) {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLogoutOpen(false);
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Network error — still proceed to login so the UI is consistent
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      <div className="border-t border-border p-3 overflow-hidden">
        <div className="flex items-center gap-3 rounded-lg px-1 py-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
            <Building2 className="size-4" aria-hidden="true" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Staff account
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Administration
              </p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutOpen(true)}
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Confirm Logout
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to log out of your admin account?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutOpen(false)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400 focus-visible:outline-red-600 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
