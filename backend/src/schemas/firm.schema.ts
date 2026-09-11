import { z } from "zod";

/**
 * Query schema for listing / reading firms
 */
export const firmQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["All", "Active", "Inactive", "Pending Accreditation", "Suspended"]).optional().default("All"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  userId: z.string().optional(),
});

export type FirmQueryInput = z.infer<typeof firmQuerySchema>;

/**
 * Create Firm Input Schema
 */
export const CreateFirmSchema = z.object({
  name: z.string().trim().min(2, "Firm legal name must be at least 2 characters long."),
  code: z.string().trim().min(2, "Firm identifier code must be at least 2 characters long."),
  contactEmail: z.string().trim().email("Please provide a valid governance email address."),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  establishedYear: z.string().optional().nullable(),
  qualityPolicy: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive", "Pending Accreditation", "Suspended"]).optional().default("Active"),
  isActive: z.boolean().optional().default(true),
  accreditationNumber: z.string().optional().nullable(),
  accreditationStandard: z.string().optional().nullable(),
  industryScope: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createBy: z.string().optional().nullable(),
});

export type CreateFirmInput = z.infer<typeof CreateFirmSchema>;

/**
 * Update Firm Input Schema (all fields optional)
 */
export const UpdateFirmSchema = CreateFirmSchema.partial();

export type UpdateFirmInput = z.infer<typeof UpdateFirmSchema>;

/**
 * Validates query parameters for GET /api/firms
 */
export function validateFirmQuery(params: Record<string, any>) {
  const result = firmQuerySchema.safeParse(params);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      data: null,
    };
  }
  return { valid: true, error: null, data: result.data };
}

/**
 * Validates request payload for POST /api/firms (Create Firm)
 */
export function validateCreateFirmInput(body: any): { valid: boolean; error?: string; data?: CreateFirmInput } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload. Expected JSON body." };
  }

  const result = CreateFirmSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid firm input data.";
    return { valid: false, error: firstError };
  }

  return {
    valid: true,
    data: {
      ...result.data,
      code: result.data.code.toUpperCase(),
    },
  };
}

/**
 * Validates request payload for PUT/PATCH /api/firms/[id] (Update Firm)
 */
export function validateUpdateFirmInput(body: any): { valid: boolean; error?: string; data?: UpdateFirmInput } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload. Expected JSON body." };
  }

  const result = UpdateFirmSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid firm update data.";
    return { valid: false, error: firstError };
  }

  return {
    valid: true,
    data: {
      ...result.data,
      ...(result.data.code ? { code: result.data.code.toUpperCase() } : {}),
    },
  };
}

/**
 * Firm Staff Member summary
 */
export interface FirmStaffSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
}

/**
 * Maintained Standard summary
 */
export interface FirmTemplateSummary {
  id: string;
  code: string;
  title: string;
  standard: string;
  industry?: string;
  version?: string;
  passingScore?: number;
}

/**
 * Enriched Firm Model Response
 */
export interface FirmDetailResponse {
  id: string;
  code: string;
  name: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  website?: string;
  establishedYear?: string;
  qualityPolicy?: string;
  logoInitials: string;
  status: string;
  isActive: boolean;
  accreditationNumber?: string;
  accreditationStandard?: string;
  industryScope?: string;
  notes?: string;
  createdAt: string;
  // Relationships & Aggregations
  assignedStaff: FirmStaffSummary[];
  assignedStaffCount: number;
  maintainedTemplates: FirmTemplateSummary[];
  maintainedTemplatesCount: number;
  totalAuditsCount?: number;
}
