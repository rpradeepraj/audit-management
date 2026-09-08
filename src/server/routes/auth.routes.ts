import { authController } from "../controllers/auth.controller";

/**
 * Server Auth Routes - Dispatches API actions to Auth Controller handlers
 */
export const authRoutes = {
  login: authController.login,
  getMe: authController.getMe,
  logout: authController.logout,
};

export default authRoutes;
