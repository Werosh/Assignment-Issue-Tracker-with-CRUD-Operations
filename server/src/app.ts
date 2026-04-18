import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { Env } from "./config/env";
import { createAuthController } from "./controllers/authController";
import { createIssueController } from "./controllers/issueController";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { issueRoutes } from "./routes/issueRoutes";

export function createApp(env: Env) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  const authController = createAuthController(env.JWT_SECRET);
  const issueController = createIssueController();

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes(authController, env.JWT_SECRET));
  app.use("/api/issues", issueRoutes(issueController, env.JWT_SECRET));

  app.use(errorHandler);

  return app;
}
