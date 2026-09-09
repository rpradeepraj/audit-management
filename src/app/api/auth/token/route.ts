import { NextRequest } from "next/server";
import { authController } from "@/server/controllers";

/**
 * Route: POST /api/auth/token
 * Issues a signed JWT token for a given authenticated user session.
 */
export async function POST(req: NextRequest) {
  return authController.issueSessionToken(req);
}
