import { NextRequest } from "next/server";
import { userBackendService } from "../services/user.service";
import { createUserSchema, updateUserSchema, userQuerySchema } from "../schemas/user.schema";
import { ApiResponse } from "../utils/apiResponse";
import { handleApiError } from "../utils/errorHandler";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth } from "../utils/auth";

export const userController = {
  /**
   * GET /api/users
   * Retrieves users list with optional firmId, search, and role filters.
   */
  async getUsers(req: NextRequest) {
    try {
      await requireAuth(req);

      const searchParams = req.nextUrl.searchParams;
      const queryParams = {
        firmId: searchParams.get("firmId") || undefined,
        role: searchParams.get("role") || undefined,
        search: searchParams.get("search") || undefined,
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      };

      const parsed = userQuerySchema.safeParse(queryParams);
      if (!parsed.success) {
        return ApiResponse.error(parsed.error.issues[0]?.message || "Invalid query parameters", 400);
      }

      const { users, total } = await userBackendService.getUsers(parsed.data);
      return ApiResponse.success(
        {
          users,
          total,
          count: users.length,
          page: parsed.data.page,
          limit: parsed.data.limit,
        },
        "Users retrieved successfully",
        200
      );
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * GET /api/users/[id]
   * Retrieves single user by ID.
   */
  async getUserById(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
    try {
      await requireAuth(req);

      const resolvedParams = await params;
      const userId = resolvedParams?.id;

      if (!userId) {
        return ApiResponse.error("User ID parameter is required", 400);
      }

      const user = await userBackendService.getUserById(userId);
      return ApiResponse.success(user, "User retrieved successfully", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * POST /api/users
   * Creates a user in auth.users, public.users, public.user_firms, public.audit_team_members.
   */
  async createUser(req: NextRequest) {
    try {
      await requireAuth(req);

      const body = await req.json().catch(() => ({}));
      const parsed = createUserSchema.safeParse(body);

      if (!parsed.success) {
        const message = parsed.error.issues.map((e) => e.message).join("; ");
        return ApiResponse.error(message || "Invalid user payload", 400);
      }

      const createdUser = await userBackendService.createUser(parsed.data);
      return ApiResponse.success(createdUser, "User account provisioned and synchronized across auth and database", 201);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * PUT /api/users/[id]
   * Updates user details in public.users and auth.users.
   */
  async updateUser(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
    try {
      await requireAuth(req);

      const resolvedParams = await params;
      const userId = resolvedParams?.id;

      if (!userId) {
        return ApiResponse.error("User ID parameter is required", 400);
      }

      const body = await req.json().catch(() => ({}));
      const parsed = updateUserSchema.safeParse(body);

      if (!parsed.success) {
        const message = parsed.error.issues.map((e) => e.message).join("; ");
        return ApiResponse.error(message || "Invalid user update payload", 400);
      }

      const updatedUser = await userBackendService.updateUser(userId, parsed.data);
      return ApiResponse.success(updatedUser, "User updated successfully", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * DELETE /api/users/[id]
   * Deletes a user across tables and Supabase Auth.
   */
  async deleteUser(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
    try {
      await requireAuth(req);

      const resolvedParams = await params;
      const userId = resolvedParams?.id;

      if (!userId) {
        return ApiResponse.error("User ID parameter is required", 400);
      }

      await userBackendService.deleteUser(userId);
      return ApiResponse.success({ id: userId }, "User account and associations removed successfully", 200);
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * POST /api/upload/avatar
   * Handles avatar image upload via FormData or Base64 JSON.
   */
  async uploadAvatar(req: NextRequest) {
    try {
      await requireAuth(req);

      const contentType = req.headers.get("content-type") || "";

      let avatarUrl = "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
          return ApiResponse.error("No image file provided in form data.", 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split(".").pop() || "png";
        const filename = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        // Attempt Supabase Storage upload
        try {
          const { error: uploadError } = await supabaseAdmin.storage
            .from("avatars")
            .upload(filename, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from("avatars")
              .getPublicUrl(filename);
            avatarUrl = publicUrlData.publicUrl;
          } else {
            console.warn("Supabase Storage bucket notice, generating data URL:", uploadError.message);
            avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
          }
        } catch {
          avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
        }
      } else {
        const body = await req.json().catch(() => ({}));
        if (!body.image) {
          return ApiResponse.error("Image payload (file or base64 string) is required.", 400);
        }
        avatarUrl = body.image;
      }

      return ApiResponse.success(
        { url: avatarUrl, avatarUrl },
        "Avatar image uploaded successfully",
        200
      );
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};

export default userController;
