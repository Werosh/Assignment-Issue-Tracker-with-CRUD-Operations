import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Field({
  label,
  children,
  className,
  icon: Icon,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-2 text-[0.82rem] font-medium text-muted">
        {Icon ? <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
