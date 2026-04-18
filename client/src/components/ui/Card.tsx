import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/90 bg-surface-850/85 shadow-[var(--shadow-elevated)] backdrop-blur-md",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
