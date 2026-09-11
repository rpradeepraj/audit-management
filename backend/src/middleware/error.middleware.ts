import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ZodError } from "zod";

/**
 * Express Middleware: Global error handling middleware.
 * Formats errors into standard API JSON response format.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Express Error Handler:", err);

  // Handle custom ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    const errorDetails = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      error: err.issues[0]?.message || "Validation failed",
      details: errorDetails,
    });
    return;
  }

  // Handle Supabase or PostgreSQL known errors
  if (err?.code && typeof err.code === "string") {
    switch (err.code) {
      case "23505": // Unique violation
        res.status(409).json({
          success: false,
          error: "A record with this information already exists in the system.",
        });
        return;
      case "23503": // Foreign key violation
        res.status(400).json({
          success: false,
          error: "Referenced record was not found.",
        });
        return;
      case "PGRST116": // Not found
        res.status(404).json({
          success: false,
          error: "Requested resource was not found.",
        });
        return;
    }
  }

  // Fallback 500 Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

export default errorHandler;
