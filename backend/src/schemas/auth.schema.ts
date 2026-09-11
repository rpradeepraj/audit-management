/**
 * Auth Schema & Data Transfer Objects (DTOs) with Zod Validation
 */

import { z } from "zod";

// ==========================================
// 1. Zod Schemas
// ==========================================

export const LoginSchema = z
  .object({
    email: z.string().trim().email("Please provide a valid email address.").optional(),
    username: z.string().trim().min(2, "Username must be at least 2 characters.").optional(),
    password: z.string().min(4, "Password must be at least 4 characters long."),
  })
  .refine((data) => data.email || data.username, {
    message: "Username or Email address is required.",
    path: ["email"],
  });

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  role: z.enum([
    "Platform Admin",
    "Company Admin",
    "Lead Auditor",
    "Auditor",
    "Auditee Representative",
    "Quality Manager",
    "Viewer",
  ]).default("Auditor"),
  firm_id: z.string().optional(),
  avatar: z.string().url("Avatar must be a valid URL.").optional(),
});

export const UserPayloadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  firm_id: z.string().optional(),
  companyName: z.string().optional(),
  Organization: z.string().optional(),
  avatar: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  email_confirmed_at: z.string().optional().nullable(),
  last_sign_in_at: z.string().optional().nullable(),
});

// ==========================================
// 2. Inferred TypeScript Types
// ==========================================

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UserPayload = z.infer<typeof UserPayloadSchema> & {
  [key: string]: any;
};

export interface AuthSessionResponse {
  authenticated: boolean;
  user?: UserPayload;
  error?: string;
}

// ==========================================
// 3. Validation Helpers
// ==========================================

/**
 * Validates login request input using Zod.
 */
export function validateLoginInput(body: any): { valid: boolean; error?: string; data?: LoginInput } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload. Expected JSON body." };
  }

  const result = LoginSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid login input.";
    return { valid: false, error: firstError };
  }

  const identifier = (result.data.email || result.data.username || "").trim();

  return {
    valid: true,
    data: {
      username: result.data.username,
      email: result.data.email || (identifier.includes("@") ? identifier : undefined),
      password: result.data.password,
    },
  };
}

/**
 * Validates registration request input using Zod.
 */
export function validateRegisterInput(body: any): { valid: boolean; error?: string; data?: RegisterInput } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload. Expected JSON body." };
  }

  const result = RegisterSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid registration input.";
    return { valid: false, error: firstError };
  }

  return {
    valid: true,
    data: result.data,
  };
}
