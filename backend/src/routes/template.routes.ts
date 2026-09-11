import { Router } from "express";
import { templateController } from "../controllers/template.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * Template Module Routes
 * Base Path: /api/templates
 */
router.use(requireAuth);

router.get("/", templateController.getTemplates);
router.get("/:id", templateController.getTemplateById);
router.post("/", templateController.createTemplate);
router.put("/:id", templateController.updateTemplate);
router.patch("/:id", templateController.updateTemplate);
router.delete("/:id", templateController.deleteTemplate);

export default router;
