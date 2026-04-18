import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const pagePadX = "px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12";

export function Page({
  title,
  subtitle,
  actions,
  children,
  className,
  /** Renders below the title row, inside the sticky top block (e.g. stat cards). Enables scroll-only children layout. */
  stickyFooter,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  stickyFooter?: ReactNode;
}) {
  const scrollLayout = Boolean(stickyFooter);

  if (scrollLayout) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden",
          pagePadX,
          className,
        )}
      >
        <div
          className={cn(
            "sticky top-0 z-20 shrink-0 border-b border-border/70 bg-surface-950/95 pb-4 pt-6 shadow-[0_1px_0_rgb(0_0_0/0.2)] backdrop-blur-md sm:pb-5 sm:pt-7",
            "-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12",
          )}
        >
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-4xl text-[0.95rem] leading-relaxed text-muted lg:max-w-5xl">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:ml-auto lg:w-auto lg:max-w-[min(100%,42rem)]">
                {actions}
              </div>
            ) : null}
          </header>
          {stickyFooter ? (
            <div className="mt-4 shrink-0 sm:mt-5">{stickyFooter}</div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain pb-[max(3rem,env(safe-area-inset-bottom))] pt-4 sm:pb-[max(4rem,env(safe-area-inset-bottom))] sm:pt-5",
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "app-scroll flex min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-[max(3rem,env(safe-area-inset-bottom))] pt-6 sm:pb-[max(4rem,env(safe-area-inset-bottom))] sm:pt-8",
        pagePadX,
        className,
      )}
    >
      <header className="mb-6 flex shrink-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-4xl text-[0.95rem] leading-relaxed text-muted lg:max-w-5xl">
              {subtitle}
            </p>
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
