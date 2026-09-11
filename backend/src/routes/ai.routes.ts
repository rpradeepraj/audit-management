import { Router } from "express";
import { aiController } from "../controllers/ai.controller";

const router = Router();

/**
 * AI Module Routes
 * Base Path: /api/ai
 */
router.post("/generate-template", aiController.generateTemplate);
router.post("/analyze-finding", aiController.analyzeFinding);
router.post("/generate-report-summary", aiController.generateReportSummary);
router.post("/risk-advisor", aiController.getRiskAdvice);

export default router;
