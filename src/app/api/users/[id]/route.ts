import { NextRequest } from "next/server";
import { userController } from "@/server/controllers/user.controller";

/**
 * GET /api/users/[id]
 * Retrieves single user details.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return userController.getUserById(req, context);
}

/**
 * PUT /api/users/[id]
 * Updates user profile and password in database and auth.
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return userController.updateUser(req, context);
}

/**
 * DELETE /api/users/[id]
 * Deletes user account and associated permissions.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return userController.deleteUser(req, context);
}
