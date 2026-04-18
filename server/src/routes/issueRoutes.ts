import { Router } from "express";
import { createIssueController } from "../controllers/issueController";
import { createAuthMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

type IssueCtl = ReturnType<typeof createIssueController>;

export function issueRoutes(controller: IssueCtl, jwtSecret: string): Router {
  const r = Router();
  const auth = createAuthMiddleware(jwtSecret);

  r.use(auth);

  r.get("/", asyncHandler(controller.list));
  r.get("/stats", asyncHandler(controller.stats));
  r.get("/export", asyncHandler(controller.exportData));
  r.get("/:id", asyncHandler(controller.getOne));
  r.post("/", asyncHandler(controller.create));
  r.patch("/:id", asyncHandler(controller.update));
  r.delete("/:id", asyncHandler(controller.remove));

  return r;
}
