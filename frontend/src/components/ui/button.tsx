// FILE: frontend/src/components/ui/button.tsx
import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-lg bg-primary font-medium text-white shadow-sm transition duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-60";

const sizes = {
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

type Size = keyof typeof sizes;

function styles(size: Size, className?: string) {
  return [base, sizes[size], className].filter(Boolean).join(" ");
}

export function Button({
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { size?: Size }) {
  return <button type={type} className={styles(size, className)} {...props} />;
}

export function ButtonLink({
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { size?: Size }) {
  return <Link className={styles(size, className)} {...props} />;
}
