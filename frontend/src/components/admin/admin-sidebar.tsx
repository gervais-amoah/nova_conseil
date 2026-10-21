"use client";

import {
  ClipboardList,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../layout/logo";
import { SidebarUserFooter } from "./admin-sidebar-footer";
// https://animate-ui.com/docs/primitives/base-ui/radio-group

const navigation = [
  {
    label: "Home",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: ClipboardList,
  },
];

type AdminSidebarProps = {
  variant?: "desktop" | "mobile";
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
};

export function AdminSidebar({
  variant = "desktop",
  isCollapsed = false,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";
  const collapsed = !isMobile && isCollapsed; // the mobile menu is never collapsed

  // export function AdminSidebar() {
  //   const pathname = usePathname();

  return (
    <aside
      className={[
        "relative flex h-full flex-col border-r border-border bg-white transition-all duration-300 ease-in-out",
        isMobile ? "w-full" : collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      {/* Header Section */}
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-border px-4 overflow-hidden">
        {collapsed ? (
          /* Collapsed Header: Toggle container on hover */
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="group relative flex size-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Default state: Logo */}
            <div className="transition-opacity duration-200 group-hover:opacity-0">
              <Logo showName={false} />
            </div>
            {/* Hover state: Expand Icon */}
            <div className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-muted-foreground group-hover:text-foreground">
              <PanelLeftOpen className="size-5" aria-hidden="true" />
            </div>
          </button>
        ) : (
          /* Expanded Header: Logo + Title on left, Collapse Icon on right */
          <>
            {/* <Link
              href="/admin/requests"
              className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground whitespace-nowrap overflow-hidden"
            >
              <Logo showName={false} />
              <span>Novae Conseil</span>
            </Link>
            <button
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
            >
              <PanelLeftClose className="size-5" aria-hidden="true" />
            </button> */}
            {isMobile ? (
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            ) : (
              <button
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-gray-100 hover:text-foreground transition-colors"
              >
                <PanelLeftClose className="size-5" aria-hidden="true" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className="flex-1 space-y-1 px-3 py-5 overflow-hidden"
      >
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={isCollapsed ? label : undefined}
              className={[
                "flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors whitespace-nowrap",
                active
                  ? "bg-accent font-medium text-primary"
                  : "text-muted-foreground hover:bg-gray-50 hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Account Section */}
      <SidebarUserFooter />
    </aside>
  );
}
