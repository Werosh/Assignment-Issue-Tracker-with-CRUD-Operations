import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full cursor-pointer appearance-none rounded-[var(--radius-lg)] border border-border bg-surface-900 py-2.5 pl-3 pr-10 text-[0.95rem] transition-[border-color,box-shadow] focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/25",
          className
        )}
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}
