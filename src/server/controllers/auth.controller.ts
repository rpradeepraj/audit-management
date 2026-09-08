import { NextRequest } from "next/server";
import { authBackendService } from "../services/auth.service";
import { validateLoginInput } from "../schemas/auth.schema";
import { ApiResponse } from "../utils/apiResponse";
import { handleApiError } from "../utils/errorHandler";

/**
 * Auth Controller - Handles HTTP requests & responses for authentication.
 */
export const authController = {
  /**
   * POST /api/auth or /api/auth/login
   * Validates request body, calls backend service, issues JWT token and sets cookie.
   */
  async login(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateLoginInput(body);

      if (!validation.valid || !validation.data) {
        return ApiResponse.error(validation.error || "Invalid request payload", 400);
      }

      const { user, token } = await authBackendService.login(validation.data);

      const response = ApiResponse.success(
        {
          token_type: "Bearer",
          token,
          user,
        },
        "Authentication successful",
        200
      );

      // Set secure HTTP-only cookie
      response.cookies.set("ams_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * GET /api/auth or /api/auth/me
   * Validates JWT token from header or cookie and returns current session.
   */
  async getMe(req: NextRequest) {
    try {
      const authHeader = req.headers.get("authorization");
      const token =
        (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null) ||
        req.cookies.get("ams_auth_token")?.value;

      if (!token) {
        return ApiResponse.error("Unauthorized: No authorization token provided", 401);
      }

      const decoded = authBackendService.verifyToken(token);
      if (!decoded) {
        return ApiResponse.error("Unauthorized: Invalid or expired token", 401);
      }

      return ApiResponse.success({ user: decoded }, "Session verified", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * POST /api/auth/logout
   * Clears authentication session cookie.
   */
  async logout(_req: NextRequest) {
    try {
      const response = ApiResponse.success({}, "Logged out successfully", 200);

      response.cookies.set("ams_auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};

export default authController;
