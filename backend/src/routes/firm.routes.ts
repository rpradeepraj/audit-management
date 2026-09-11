import { Router } from "express";
import { firmController } from "../controllers/firm.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * Firm Module Routes
 * Base Path: /api/firms
 */
router.use(requireAuth);

router.get("/", firmController.getFirms);
router.get("/:id", firmController.getFirmById);
router.post("/", firmController.createFirm);
router.put("/:id", firmController.updateFirm);
router.patch("/:id", firmController.updateFirm);
router.delete("/:id", firmController.deleteFirm);

export default router;
