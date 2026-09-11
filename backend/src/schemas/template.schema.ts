import { z } from "zod";

export const templateQuestionSchema = z.object({
  id: z.string().optional(),
  requirementId: z.string().optional().default("1.1"),
  requirement_id: z.string().optional(),
  question: z.string().min(1, "Question text is required"),
  guidance: z.string().optional().default(""),
  scoringType: z.enum(["PASS_FAIL", "COMPLIANCE_RATING", "SEVERITY_BASED", "NUMERIC"]).optional().default("PASS_FAIL"),
  scoring_type: z.string().optional(),
  weight: z.number().min(0).max(100).optional().default(10),
  mandatory: z.boolean().optional().default(false),
  orderIndex: z.number().optional().default(0),
  order_index: z.number().optional(),
  globalQuestionId: z.string().optional(),
  global_question_id: z.string().optional(),
});

export const templateSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional().default(""),
  weight: z.number().min(0).max(100).optional().default(100),
  orderIndex: z.number().optional().default(0),
  order_index: z.number().optional(),
  globalSectionId: z.string().optional(),
  global_section_id: z.string().optional(),
  questions: z.array(templateQuestionSchema).optional().default([]),
});

export const templateQuerySchema = z.object({
  type: z.enum(["all", "default", "global", "custom", "firm"]).optional().default("all"),
  firmId: z.string().optional(),
  search: z.string().optional(),
  standard: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const createTemplateSchema = z
  .object({
    firmId: z.string().optional(),
    firm_id: z.string().optional(),
    globalTemplateId: z.string().optional(),
    global_template_id: z.string().optional(),
    title: z.string().optional(),
    code: z.string().optional(),
    standard: z.string().optional(),
    industry: z.string().optional().default("General Industry"),
    version: z.string().optional().default("1.0"),
    passingScore: z.number().min(0).max(100).optional().default(80),
    passing_score: z.number().optional(),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().optional().default(""),
    isCustom: z.boolean().optional().default(true),
    is_custom: z.boolean().optional(),
    isDefaultIndustryTemplate: z.boolean().optional().default(false),
    createdBy: z.string().optional(),
    created_by: z.string().optional(),
    sections: z.array(templateSectionSchema).optional().default([]),
  })
  .refine(
    (data) => {
      // If linking a global template, globalTemplateId is sufficient.
      if (data.globalTemplateId || data.global_template_id) return true;
      // Otherwise, title is required.
      return Boolean(data.title && data.title.trim().length >= 2);
    },
    {
      message: "Template title is required when creating a custom template",
      path: ["title"],
    }
  );

export const updateTemplateSchema = z.object({
  title: z.string().min(2).optional(),
  code: z.string().optional(),
  standard: z.string().optional(),
  industry: z.string().optional(),
  version: z.string().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  passing_score: z.number().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sections: z.array(templateSectionSchema).optional(),
});

export type TemplateQueryInput = z.infer<typeof templateQuerySchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateSectionInput = z.infer<typeof templateSectionSchema>;
export type TemplateQuestionInput = z.infer<typeof templateQuestionSchema>;

export function validateTemplateQuery(data: unknown) {
  const parsed = templateQuerySchema.safeParse(data);
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues[0]?.message || "Invalid query" };
  }
  return { valid: true, data: parsed.data };
}

export function validateCreateTemplateInput(data: unknown) {
  const parsed = createTemplateSchema.safeParse(data);
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues[0]?.message || "Invalid template payload" };
  }
  return { valid: true, data: parsed.data };
}

export function validateUpdateTemplateInput(data: unknown) {
  const parsed = updateTemplateSchema.safeParse(data);
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues[0]?.message || "Invalid update payload" };
  }
  return { valid: true, data: parsed.data };
}
