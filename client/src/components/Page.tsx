import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Page({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-6", className)}>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-muted">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
