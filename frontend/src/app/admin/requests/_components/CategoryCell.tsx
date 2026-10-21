// _components/CategoryCell.tsx
export function CategoryCell({
  value,
  corrected = false,
}: {
  value: string | null;
  corrected?: boolean;
}) {
  if (!value) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="max-w-45 truncate">{value}</span>
      {corrected && (
        <span
          title="Human-corrected classification"
          className="size-1.5 shrink-0 rounded-full bg-amber-500"
        />
      )}
    </span>
  );
}
