import { Request, Response, NextFunction } from "express";
import { firmBackendService } from "../services/firm.service";
import {
  validateFirmQuery,
  validateCreateFirmInput,
  validateUpdateFirmInput,
} from "../schemas/firm.schema";
import { ApiError } from "../utils/apiError";

/**
 * Firm Controller - Express Request/Response handlers for Audit Firms.
 */
export const firmController = {
  /**
   * GET /api/firms
   * Returns list of accredited audit firms with assigned staff & templates.
   */
  async getFirms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = {
        search: req.query.search ? String(req.query.search) : undefined,
        status: req.query.status ? String(req.query.status) : "All",
        limit: req.query.limit ? Number(req.query.limit) : 50,
        offset: req.query.offset ? Number(req.query.offset) : 0,
        userId: req.query.userId ? String(req.query.userId) : undefined,
      };

      const validation = validateFirmQuery(queryParams);
      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid query parameters");
      }

      const { firms, total } = await firmBackendService.getFirms(validation.data);

      res.status(200).json({
        success: true,
        message: "Audit firms retrieved successfully",
        firms,
        total,
        count: firms.length,
        limit: validation.data.limit,
        offset: validation.data.offset,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/firms/:id
   * Returns single audit firm by ID or Code.
   */
  async getFirmById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const firmId = String(req.params.id || "");
      if (!firmId) {
        throw new ApiError(400, "Firm ID parameter is required");
      }

      const firm = await firmBackendService.getFirmById(firmId);
      res.status(200).json({
        success: true,
        message: "Audit firm retrieved successfully",
        firm,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/firms
   * Creates a new audit firm in Supabase database.
   */
  async createFirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateCreateFirmInput(req.body);
      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid firm payload");
      }

      const createdFirm = await firmBackendService.createFirm(validation.data);
      res.status(201).json({
        success: true,
        message: "Audit firm registered successfully in database",
        firm: createdFirm,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/firms/:id or PATCH /api/firms/:id
   * Updates an existing audit firm in Supabase database.
   */
  async updateFirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const firmId = String(req.params.id || "");
      if (!firmId) {
        throw new ApiError(400, "Firm ID parameter is required");
      }

      const validation = validateUpdateFirmInput(req.body);
      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid firm update payload");
      }

      const updatedFirm = await firmBackendService.updateFirm(firmId, validation.data);
      res.status(200).json({
        success: true,
        message: "Audit firm updated successfully in database",
        firm: updatedFirm,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/firms/:id
   * Deletes an audit firm from Supabase database.
   */
  async deleteFirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const firmId = String(req.params.id || "");
      if (!firmId) {
        throw new ApiError(400, "Firm ID parameter is required");
      }

      await firmBackendService.deleteFirm(firmId);
      res.status(200).json({
        success: true,
        message: "Audit firm deleted successfully from database",
        id: firmId,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default firmController;
