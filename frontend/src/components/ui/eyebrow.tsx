export function Eyebrow({
  className = "",
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={`text-[11px] font-medium uppercase tracking-[0.12em] text-primary ${className}`}
      {...props}
    />
  );
}
