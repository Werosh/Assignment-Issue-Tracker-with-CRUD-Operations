import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/** Attach HTTP status to thrown errors for the global handler */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", details: err.flatten() });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Unexpected error";
  const status =
    err && typeof err === "object" && "status" in err && typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
}
