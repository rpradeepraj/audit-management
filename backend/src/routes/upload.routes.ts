import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Upload Module Routes
 * Base Path: /api/upload
 */
router.use(requireAuth);

router.post("/avatar", upload.single("file"), uploadController.uploadAvatar);

export default router;
