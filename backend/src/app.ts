import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/error.middleware";

// Load environment variables
dotenv.config();

/**
 * Express Application Factory & Setup
 */
export function createApp(): Express {
  const app = express();

  // 1. Core Middlewares
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or any localhost origin
        if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/staging
        }
      },
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // 2. Request Logger (Development / Debug)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  // 3. Health & Status Endpoints
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: "Audit Management System Express Backend",
    });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      message: "Audit Management System API is running.",
      docs: "/api/health",
      status: 200,
    });
  });

  // 4. Mount Master API Router
  app.use("/api", apiRouter);

  // 5. 404 Route Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    });
  });

  // 6. Global Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
