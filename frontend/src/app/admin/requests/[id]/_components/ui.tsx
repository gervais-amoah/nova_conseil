import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function SectionHeading({
  icon: Icon,
  children,
  trailing,
}: {
  icon: LucideIcon;
  children: ReactNode;
  trailing?: ReactNode;
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

export function InfoCard({
  children,
  className = "",
}: {
  children: ReactNode;
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
