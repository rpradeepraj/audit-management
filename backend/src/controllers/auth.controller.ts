import { Request, Response, NextFunction } from "express";
import { authBackendService } from "../services/auth.service";
import { validateLoginInput } from "../schemas/auth.schema";
import { ApiError } from "../utils/apiError";

/**
 * Auth Controller - Express Request/Response handlers for Authentication.
 */
export const authController = {
  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid request payload");
      }

      const { user, token } = await authBackendService.login(validation.data);

      // Set HTTP-only Cookie
      res.cookie("ams_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      });

      res.status(200).json({
        success: true,
        message: "Authentication successful",
        token_type: "Bearer",
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.ams_auth_token;
      const token = (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null) || cookieToken;

      if (!token) {
        throw new ApiError(401, "Unauthorized: No authorization token provided");
      }

      const decoded = await authBackendService.verifyTokenAsync(token);
      if (!decoded) {
        throw new ApiError(401, "Unauthorized: Invalid or expired token");
      }

      res.status(200).json({
        success: true,
        message: "Session verified",
        user: decoded,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie("ams_auth_token", {
        path: "/",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/token
   */
  async issueSessionToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body || {};
      if (!body.id || !body.email) {
        throw new ApiError(400, "User ID and Email are required to issue a token.");
      }

      const token = authBackendService.generateToken({
        id: body.id,
        email: body.email,
        name: body.name || "User",
        role: body.role || "Auditor",
        firm_id: body.firm_id || body.companyId || "",
        companyName: body.companyName || "Audit Firm",
        Organization: body.Organization || body.companyName || "Audit Firm",
      });

      res.cookie("ams_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Token issued successfully",
        token_type: "Bearer",
        token,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
