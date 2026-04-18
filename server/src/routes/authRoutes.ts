import { Router } from "express";
import { createAuthController } from "../controllers/authController";
import { createAuthMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

type AuthCtl = ReturnType<typeof createAuthController>;

export function authRoutes(controller: AuthCtl, jwtSecret: string): Router {
  const r = Router();
  const auth = createAuthMiddleware(jwtSecret);

  r.post("/register", asyncHandler(controller.register));
  r.post("/login", asyncHandler(controller.login));
  r.get("/me", auth, asyncHandler(controller.me));

  return r;
}
