import { Request, Response, NextFunction } from "express";
import { aiBackendService } from "../services/ai.service";

/**
 * AI Controller - Express Request/Response handlers for Gemini AI auditing features.
 */
export const aiController = {
  /**
   * POST /api/ai/generate-template
   */
  async generateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiBackendService.generateTemplate(req.body || {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/analyze-finding
   */
  async analyzeFinding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiBackendService.analyzeFinding(req.body || {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/generate-report-summary
   */
  async generateReportSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiBackendService.generateReportSummary(req.body || {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/risk-advisor
   */
  async getRiskAdvice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiBackendService.getRiskAdvice(req.body || {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default aiController;
