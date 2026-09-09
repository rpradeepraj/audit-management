import { NextRequest } from "next/server";
import { userController } from "@/server/controllers/user.controller";


/**
 * POST /api/users
 * Creates new user across auth.users, public.users, public.user_firms, public.audit_team_members.
 */
export async function POST(req: NextRequest) {
  return userController.createUser(req);
}
