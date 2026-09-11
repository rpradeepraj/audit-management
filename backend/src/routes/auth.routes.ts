import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

/**
 * Auth Module Routes
 * Base Path: /api/auth
 */
router.post("/login", authController.login);
router.post("/", authController.login); // alias
router.get("/me", authController.getMe);
router.get("/", authController.getMe); // alias
router.post("/logout", authController.logout);
router.post("/token", authController.issueSessionToken);

export default router;
