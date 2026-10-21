import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[218px_minmax(0,1fr)]">
        <div className="hidden md:block">
          <div className="sticky top-0 h-screen">
            <AdminSidebar />
          </div>
        </div>

        <div className="min-w-0">
          <div className="md:hidden">
            <AdminSidebar />
          </div>

          {children}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
