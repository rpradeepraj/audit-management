import { Router } from "express";
import authRoutes from "./auth.routes";
import firmRoutes from "./firm.routes";
import userRoutes from "./user.routes";
import templateRoutes from "./template.routes";
import uploadRoutes from "./upload.routes";
import aiRoutes from "./ai.routes";

const apiRouter = Router();

/**
 * Mount Module Sub-routers
 */
apiRouter.use("/auth", authRoutes);
apiRouter.use("/firms", firmRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/templates", templateRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/ai", aiRoutes);

// General API health check
apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Audit Management System Express API",
    modules: ["auth", "firms", "users", "templates", "upload", "ai"],
  });
});

export { authRoutes, firmRoutes, userRoutes, templateRoutes, uploadRoutes, aiRoutes };
export default apiRouter;
