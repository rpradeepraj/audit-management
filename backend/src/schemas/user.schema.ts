import { z } from "zod";

export const USER_ROLES = [
  "Admin",
  "Audit Manager",
  "Auditor",
  "Client Representative",
] as const;

export const createUserSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("A valid corporate email is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm password is required."),
    role: z.string().default("Auditor"),
    phone: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    firmId: z.string().optional().nullable(),
    auditId: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must match.",
    path: ["confirmPassword"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().nullable(),
  confirmPassword: z.string().min(6).optional().nullable(),
  role: z.string().optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  firmId: z.string().optional().nullable(),
  auditId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive"]).optional(),
}).refine(
  (data) => {
    if (data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Password and confirm password must match.",
    path: ["confirmPassword"],
  }
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userQuerySchema = z.object({
  firmId: z.string().optional(),
  role: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
