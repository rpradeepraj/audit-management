import { authController } from "@/server/controllers";

/**
 * GET /api/auth/me
 */
export const GET = authController.getMe;
