import { Request, Response, NextFunction } from "express";
import { authBackendService } from "../services/auth.service";
import { ApiError } from "../utils/apiError";
import { UserPayload } from "../schemas/auth.schema";

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Express Middleware: Extracts and validates JWT token from Authorization header or cookies.
 * Sets req.user upon successful verification.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.ams_auth_token;
    
    const token = (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null) || cookieToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized: Authentication token is required.");
    }

    const user = await authBackendService.verifyTokenAsync(token);
    if (!user) {
      throw new ApiError(401, "Unauthorized: Invalid or expired authentication token.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Express Middleware: Role-based access control.
 */
export function requireRoles(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: Session not found."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Forbidden: Requires one of roles: [${allowedRoles.join(", ")}]`));
    }

    next();
  };
}

export default requireAuth;
