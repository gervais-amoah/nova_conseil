import { SITE } from "@/lib/constants/site";

export function Logo({ showName = true }: { showName?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="text-primary"
      >
        <path d="M3 4l6 0 4 8-4 8H3l4-8L3 4z" fill="currentColor" />
        <path d="M12 4h5l4 4-6 6-3-6z" fill="currentColor" opacity=".7" />
      </svg>
      {showName && (
        <span className="text-[15px] font-medium text-foreground">
          {SITE.name}
        </span>
      )}
    </span>
  );
}
