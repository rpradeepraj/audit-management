import { authController } from "@/server/controllers";

/**
 * Route: /api/auth
 */
export const POST = authController.login;
export const GET = authController.getMe;
