import { NextResponse } from "next/server";
import { ApiError } from "./apiError";
import { ApiResponse } from "./apiResponse";

export interface ErrorDetails {
  statusCode: number;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Maps Supabase Auth and Database error codes to standardized HTTP status and messages.
 */
export function mapSupabaseError(error: any): ErrorDetails {
  if (!error) {
    return { statusCode: 500, message: "Internal server error" };
  }

  const rawMessage = error.message || "";
  const code = error.code || error.status || "";

  // 1. Common Supabase Auth error mappings
  switch (code) {
    case "invalid_credentials":
    case 400:
      if (rawMessage.toLowerCase().includes("invalid login credentials")) {
        return { statusCode: 401, message: "Invalid email/username or password credentials.", code: "INVALID_CREDENTIALS" };
      }
      if (rawMessage.toLowerCase().includes("email not confirmed")) {
        return { statusCode: 403, message: "Email address has not been confirmed. Please check your inbox.", code: "EMAIL_NOT_CONFIRMED" };
      }
      return { statusCode: 400, message: rawMessage || "Bad Request", code: "BAD_REQUEST" };

    case "user_not_found":
    case 404:
      return { statusCode: 404, message: "Account not found with the provided credentials.", code: "USER_NOT_FOUND" };

    case "over_request_rate_limit":
    case 429:
      return { statusCode: 429, message: "Too many login attempts. Please try again after a few minutes.", code: "RATE_LIMITED" };

    case "user_already_exists":
    case 409:
      return { statusCode: 409, message: "An account with this email address already exists.", code: "USER_ALREADY_EXISTS" };

    case "session_expired":
    case "jwt_expired":
      return { statusCode: 401, message: "Your session has expired. Please sign in again.", code: "SESSION_EXPIRED" };

    default:
      if (rawMessage.toLowerCase().includes("invalid login")) {
        return { statusCode: 401, message: "Invalid email/username or password.", code: "INVALID_CREDENTIALS" };
      }
      return { statusCode: error.status || 500, message: rawMessage || "An unexpected error occurred.", code: "SERVER_ERROR" };
  }
}

/**
 * Universal Controller Error Handler for all API routes.
 */
export function handleApiError(error: any): NextResponse {
  console.error("API Error Captured:", error);

  if (error instanceof ApiError) {
    return ApiResponse.error(error.message, error.statusCode);
  }

  const mapped = mapSupabaseError(error);
  return ApiResponse.error(mapped.message, mapped.statusCode, { code: mapped.code });
}

export default handleApiError;
