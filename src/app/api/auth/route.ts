import { authRoutes } from "@/server/routes";

/**
 * Route: /api/auth
 */
export const POST = authRoutes.login;
export const GET = authRoutes.getMe;
