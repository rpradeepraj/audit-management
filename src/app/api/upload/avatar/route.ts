import { NextRequest } from "next/server";
import { userController } from "@/server/controllers/user.controller";

/**
 * POST /api/upload/avatar
 * Handles avatar image upload.
 */
export async function POST(req: NextRequest) {
  return userController.uploadAvatar(req);
}
