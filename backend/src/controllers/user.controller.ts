import { Request, Response, NextFunction } from "express";
import { userBackendService } from "../services/user.service";
import { createUserSchema, updateUserSchema, userQuerySchema } from "../schemas/user.schema";
import { ApiError } from "../utils/apiError";

/**
 * User Controller - Express Request/Response handlers for Users.
 */
export const userController = {
  /**
   * GET /api/users
   * Retrieves users list with optional firmId, search, and role filters.
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = {
        firmId: req.query.firmId ? String(req.query.firmId) : undefined,
        role: req.query.role ? String(req.query.role) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
      };

      const parsed = userQuerySchema.safeParse(queryParams);
      if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid query parameters");
      }

      const { users, total } = await userBackendService.getUsers(parsed.data);
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        users,
        total,
        count: users.length,
        page: parsed.data.page,
        limit: parsed.data.limit,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users/:id
   * Retrieves single user by ID.
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id || "");
      if (!userId) {
        throw new ApiError(400, "User ID parameter is required");
      }

      const user = await userBackendService.getUserById(userId);
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/users
   * Creates a user in auth.users, public.users, public.user_firms, public.audit_team_members.
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.issues.map((e) => e.message).join("; ");
        throw new ApiError(400, message || "Invalid user payload");
      }

      const createdUser = await userBackendService.createUser(parsed.data);
      res.status(201).json({
        success: true,
        message: "User account provisioned and synchronized across auth and database",
        user: createdUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/users/:id
   * Updates user details in public.users and auth.users.
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id || "");
      if (!userId) {
        throw new ApiError(400, "User ID parameter is required");
      }

      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.issues.map((e) => e.message).join("; ");
        throw new ApiError(400, message || "Invalid user update payload");
      }

      const updatedUser = await userBackendService.updateUser(userId, parsed.data);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/users/:id
   * Deletes a user across tables and Supabase Auth.
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id || "");
      if (!userId) {
        throw new ApiError(400, "User ID parameter is required");
      }

      await userBackendService.deleteUser(userId);
      res.status(200).json({
        success: true,
        message: "User account and associations removed successfully",
        id: userId,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
