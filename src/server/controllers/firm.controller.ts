import { NextRequest } from "next/server";
import { firmBackendService } from "../services/firm.service";
import {
  validateFirmQuery,
  validateCreateFirmInput,
  validateUpdateFirmInput,
} from "../schemas/firm.schema";
import { ApiResponse } from "../utils/apiResponse";
import { handleApiError } from "../utils/errorHandler";
import { requireAuth } from "../utils/auth";

/**
 * Firm Controller - Handles HTTP requests & responses for Audit Firms.
 * Validates JWT authentication token before executing GET, POST, PUT, DELETE operations.
 */
export const firmController = {
  /**
   * GET /api/firms
   * Returns list of accredited audit firms with assigned staff & templates.
   */
  async getFirms(req: NextRequest) {
    try {
      await requireAuth(req);

      const searchParams = req.nextUrl.searchParams;
      const queryParams = {
        search: searchParams.get("search") || undefined,
        status: searchParams.get("status") || "All",
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
        offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
        userId: searchParams.get("userId") || undefined,
      };

      const validation = validateFirmQuery(queryParams);
      if (!validation.valid || !validation.data) {
        return ApiResponse.error(validation.error || "Invalid query parameters", 400);
      }

      const { firms, total } = await firmBackendService.getFirms(validation.data);

      return ApiResponse.success(
        {
          firms,
          total,
          count: firms.length,
          limit: validation.data.limit,
          offset: validation.data.offset,
        },
        "Audit firms retrieved successfully",
        200
      );
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * GET /api/firms/[id]
   * Returns single audit firm by ID or Code.
   */
  async getFirmById(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
    try {
      await requireAuth(req);

      const resolvedParams = await params;
      const firmId = resolvedParams?.id;

      if (!firmId) {
        return ApiResponse.error("Firm ID parameter is required", 400);
      }

      const firm = await firmBackendService.getFirmById(firmId);
      return ApiResponse.success(firm, "Audit firm retrieved successfully", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * POST /api/firms
   * Creates a new audit firm in Supabase database.
   */
  async createFirm(req: NextRequest) {
    try {
      await requireAuth(req);

      const body = await req.json().catch(() => ({}));
      const validation = validateCreateFirmInput(body);

      if (!validation.valid || !validation.data) {
        return ApiResponse.error(validation.error || "Invalid firm payload", 400);
      }

      const createdFirm = await firmBackendService.createFirm(validation.data);
      return ApiResponse.success(createdFirm, "Audit firm registered successfully in database", 201);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * PUT /api/firms/[id] or PATCH /api/firms/[id]
   * Updates an existing audit firm in Supabase database.
   */
  async updateFirm(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
    try {
      await requireAuth(req);

      const resolvedParams = await params;
      const firmId = resolvedParams?.id;

      if (!firmId) {
        return ApiResponse.error("Firm ID parameter is required", 400);
      }

      const body = await req.json().catch(() => ({}));
      const validation = validateUpdateFirmInput(body);

      if (!validation.valid || !validation.data) {
        return ApiResponse.error(validation.error || "Invalid firm update payload", 400);
      }

      const updatedFirm = await firmBackendService.updateFirm(firmId, validation.data);
      return ApiResponse.success(updatedFirm, "Audit firm updated successfully in database", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * DELETE /api/firms/[id]
   * Deletes an audit firm from Supabase database.
   */
  async deleteFirm(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
    try {
      await requireAuth(req);

      const resolvedParams = await params;
      const firmId = resolvedParams?.id;

      if (!firmId) {
        return ApiResponse.error("Firm ID parameter is required", 400);
      }

      await firmBackendService.deleteFirm(firmId);
      return ApiResponse.success({ id: firmId }, "Audit firm deleted successfully from database", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};

export default firmController;
