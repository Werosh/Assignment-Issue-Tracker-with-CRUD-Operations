import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function createAuthMiddleware(jwtSecret: string) {
  return async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const token = header.slice(7);
    try {
      const payload = await verifyToken(token, jwtSecret);
      req.userId = payload.sub;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
