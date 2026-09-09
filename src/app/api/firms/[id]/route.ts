import { NextRequest } from "next/server";
import { firmController } from "@/server/controllers/firm.controller";

/**
 * GET /api/firms/[id]
 * Read single audit firm by ID or Code.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return firmController.getFirmById(req, context);
}

/**
 * PUT /api/firms/[id]
 * Update audit firm details in Supabase.
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return firmController.updateFirm(req, context);
}

/**
 * PATCH /api/firms/[id]
 * Partial update for audit firm details in Supabase.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return firmController.updateFirm(req, context);
}

/**
 * DELETE /api/firms/[id]
 * Delete audit firm from Supabase.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return firmController.deleteFirm(req, context);
}
