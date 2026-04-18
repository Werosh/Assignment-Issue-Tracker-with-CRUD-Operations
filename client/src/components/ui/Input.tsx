import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-lg)] border border-border bg-surface-900 px-3 py-2.5 text-[0.95rem] shadow-inner shadow-black/20 transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/25",
        className
      )}
      {...props}
    />
  );
}
