import { NextRequest } from "next/server";
import { firmController } from "@/server/controllers/firm.controller";

/**
 * GET /api/firms
 * List all accredited audit firms with search, status filter, and staff/template counts.
 */
export async function GET(req: NextRequest) {
  return firmController.getFirms(req);
}

/**
 * POST /api/firms
 * Register a new audit firm into Supabase database.
 */
export async function POST(req: NextRequest) {
  return firmController.createFirm(req);
}
