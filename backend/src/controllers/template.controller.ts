import { Request, Response, NextFunction } from "express";
import { templateBackendService } from "../services/template.service";
import {
  validateTemplateQuery,
  validateCreateTemplateInput,
  validateUpdateTemplateInput,
} from "../schemas/template.schema";
import { ApiError } from "../utils/apiError";

/**
 * Template Controller - Express Request/Response handlers for Audit Templates.
 */
export const templateController = {
  /**
   * GET /api/templates
   * Retrieves templates (global default library + custom firm templates).
   */
  async getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = {
        type: req.query.type ? String(req.query.type) : "all",
        firmId: req.query.firmId ? String(req.query.firmId) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        standard: req.query.standard ? String(req.query.standard) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 100,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      };

      const validation = validateTemplateQuery(queryParams);
      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid query parameters");
      }

      const { templates, total } = await templateBackendService.getTemplates(validation.data);

      res.status(200).json({
        success: true,
        message: "Templates retrieved successfully",
        templates,
        total,
        count: templates.length,
        limit: validation.data.limit,
        offset: validation.data.offset,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/templates/:id
   * Retrieves a single template by ID.
   */
  async getTemplateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = String(req.params.id || "");
      if (!templateId) {
        throw new ApiError(400, "Template ID parameter is required");
      }

      const template = await templateBackendService.getTemplateById(templateId);
      res.status(200).json({
        success: true,
        message: "Template retrieved successfully",
        template,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/templates
   * Creates a new custom firm template or links/clones a global library template.
   */
  async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateCreateTemplateInput({
        ...req.body,
        createdBy: req.user?.id,
      });

      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid template payload");
      }

      const created = await templateBackendService.createTemplate(validation.data);
      res.status(201).json({
        success: true,
        message: "Template created successfully in Supabase",
        template: created,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/templates/:id or PATCH /api/templates/:id
   * Updates an existing template and its section/question hierarchy.
   */
  async updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = String(req.params.id || "");
      if (!templateId) {
        throw new ApiError(400, "Template ID parameter is required");
      }

      const validation = validateUpdateTemplateInput(req.body);
      if (!validation.valid || !validation.data) {
        throw new ApiError(400, validation.error || "Invalid template update payload");
      }

      const updated = await templateBackendService.updateTemplate(templateId, validation.data);
      res.status(200).json({
        success: true,
        message: "Template updated successfully",
        template: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/templates/:id
   * Deletes a firm template or deactivates a global template.
   */
  async deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = String(req.params.id || "");
      if (!templateId) {
        throw new ApiError(400, "Template ID parameter is required");
      }

      const result = await templateBackendService.deleteTemplate(templateId);
      res.status(200).json({
        success: true,
        message: result.message,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default templateController;
