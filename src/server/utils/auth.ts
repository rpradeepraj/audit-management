import { NextRequest } from "next/server";
import { authBackendService } from "../services/auth.service";
import { ApiError } from "./apiError";
import { UserPayload } from "../schemas/auth.schema";

/**
 * Extracts and validates the JWT Bearer token or cookie from an incoming API request.
 * Throws an ApiError(401) if the token is missing, invalid, or expired.
 * Returns the decoded UserPayload upon successful validation.
 */
export async function requireAuth(req: NextRequest): Promise<UserPayload> {
  const authHeader = req.headers.get("authorization");
  const token =
    (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null) ||
    req.cookies.get("ams_auth_token")?.value;

  if (!token) {
    throw new ApiError(401, "Unauthorized: Authentication token is required to access this resource.");
  }

  const user = await authBackendService.verifyTokenAsync(token);
  if (!user) {
    throw new ApiError(401, "Unauthorized: Invalid or expired authentication token.");
  }

  return user;
}

export default requireAuth;
