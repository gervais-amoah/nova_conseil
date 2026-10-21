"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close the mobile menu after navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop: fixed sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden md:block">
        <AdminSidebar
          variant="desktop"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile: only the open icon is visible */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-white px-3 md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMobileOpen}
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
        >
          <PanelLeftOpen className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile: full-screen menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <AdminSidebar
            variant="mobile"
            onClose={() => setIsMobileOpen(false)}
          />
        </div>
      )}

      {/* Content leaves/reclaims the sidebar's space */}
      <div
        className={[
          "min-w-0 transition-[padding] duration-300 ease-in-out",
          isCollapsed ? "md:pl-16" : "md:pl-64",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
