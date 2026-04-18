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
    <div
      className={cn(
        "flex min-h-0 w-full max-w-full flex-1 flex-col px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-[max(4rem,env(safe-area-inset-bottom))] sm:pt-8 lg:px-8 xl:px-10 2xl:px-12",
        className
      )}
    >
      <header className="mb-6 flex shrink-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-4xl text-[0.95rem] leading-relaxed text-muted lg:max-w-5xl">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:ml-auto lg:w-auto lg:max-w-[min(100%,42rem)]">
            {actions}
          </div>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
