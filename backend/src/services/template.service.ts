import { supabaseAdmin } from "../config/supabase";
import {
  TemplateQueryInput,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateSectionInput,
} from "../schemas/template.schema";
import { AuditTemplate, ChecklistSection, ChecklistQuestion } from "../types/audit";
import { ApiError } from "../utils/apiError";

export const templateBackendService = {
  /**
   * Retrieves templates from Supabase.
   * Merges global_templates (default catalog) and firm_templates (custom / linked firm templates).
   */
  async getTemplates(query: TemplateQueryInput): Promise<{ templates: AuditTemplate[]; total: number }> {
    const { type = "all", firmId, search, standard, limit = 100, offset = 0 } = query;

    const templates: AuditTemplate[] = [];

    // 1. Fetch Global Templates if requested
    if (type === "all" || type === "default" || type === "global") {
      let gQuery = supabaseAdmin
        .from("global_templates")
        .select(`
          id,
          code,
          title,
          standard,
          industry,
          version,
          passing_score,
          tags,
          description,
          is_active,
          created_at,
          created_on,
          last_modified_at,
          global_sections (
            id,
            title,
            description,
            weight,
            order_index,
            global_questions (
              id,
              requirement_id,
              question,
              guidance,
              scoring_type,
              weight,
              mandatory,
              order_index
            )
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (standard) {
        gQuery = gQuery.ilike("standard", `%${standard}%`);
      }

      const { data: gData, error: gError } = await gQuery;
      if (gError) {
        console.error("Failed to fetch global_templates:", gError);
      } else if (gData) {
        for (const item of gData) {
          const sections: ChecklistSection[] = (item.global_sections || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((sec: any) => ({
              id: sec.id,
              title: sec.title || "",
              description: sec.description || "",
              weight: Number(sec.weight) || 100,
              questions: (sec.global_questions || [])
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((q: any) => ({
                  id: q.id,
                  requirementId: q.requirement_id || "",
                  question: q.question || "",
                  guidance: q.guidance || "",
                  scoringType: (q.scoring_type as any) || "PASS_FAIL",
                  weight: Number(q.weight) || 10,
                  mandatory: Boolean(q.mandatory),
                })),
            }));

          templates.push({
            id: item.id,
            code: item.code,
            title: item.title,
            standard: item.standard,
            industry: item.industry || "General Industry",
            version: item.version || "1.0",
            passingScore: Number(item.passing_score) || 80,
            tags: item.tags || [],
            description: item.description || "",
            isDefaultIndustryTemplate: true,
            isCustom: false,
            sections,
            createdAt: item.created_on || item.created_at?.split("T")[0] || "",
            updatedAt: item.last_modified_at?.split("T")[0] || "",
          });
        }
      }
    }

    // 2. Fetch Firm Templates if requested
    if (type === "all" || type === "custom" || type === "firm") {
      let fQuery = supabaseAdmin
        .from("firm_templates")
        .select(`
          id,
          firm_id,
          global_template_id,
          code,
          title,
          standard,
          industry,
          version,
          passing_score,
          tags,
          description,
          is_custom,
          is_active,
          created_at,
          created_on,
          last_modified_at,
          firm_sections (
            id,
            title,
            description,
            weight,
            order_index,
            firm_questions (
              id,
              requirement_id,
              question,
              guidance,
              scoring_type,
              weight,
              mandatory,
              order_index
            )
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (firmId) {
        fQuery = fQuery.eq("firm_id", firmId);
      }
      if (standard) {
        fQuery = fQuery.ilike("standard", `%${standard}%`);
      }

      const { data: fData, error: fError } = await fQuery;
      if (fError) {
        console.error("Failed to fetch firm_templates:", fError);
      } else if (fData) {
        for (const item of fData) {
          const sections: ChecklistSection[] = (item.firm_sections || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((sec: any) => ({
              id: sec.id,
              title: sec.title || "",
              description: sec.description || "",
              weight: Number(sec.weight) || 100,
              questions: (sec.firm_questions || [])
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((q: any) => ({
                  id: q.id,
                  requirementId: q.requirement_id || "",
                  question: q.question || "",
                  guidance: q.guidance || "",
                  scoringType: (q.scoring_type as any) || "PASS_FAIL",
                  weight: Number(q.weight) || 10,
                  mandatory: Boolean(q.mandatory),
                })),
            }));

          templates.push({
            id: item.id,
            code: item.code,
            title: item.title,
            standard: item.standard,
            industry: item.industry || "General Industry",
            version: item.version || "1.0",
            passingScore: Number(item.passing_score) || 80,
            tags: item.tags || [],
            description: item.description || "",
            isDefaultIndustryTemplate: false,
            isCustom: true,
            firmId: item.firm_id,
            globalTemplateId: item.global_template_id,
            sections,
            createdAt: item.created_on || item.created_at?.split("T")[0] || "",
            updatedAt: item.last_modified_at?.split("T")[0] || "",
          });
        }
      }
    }

    // 3. Search Filter in-memory if query search provided
    let filtered = templates;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      filtered = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.standard.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.industry.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return { templates: paginated, total };
  },

  /**
   * Retrieves a single template by ID (checks firm_templates first, then global_templates).
   */
  async getTemplateById(id: string): Promise<AuditTemplate> {
    // 1. Check firm_templates
    const { data: fData, error: fError } = await supabaseAdmin
      .from("firm_templates")
      .select(`
        id,
        firm_id,
        global_template_id,
        code,
        title,
        standard,
        industry,
        version,
        passing_score,
        tags,
        description,
        is_custom,
        is_active,
        created_at,
        created_on,
        last_modified_at,
        firm_sections (
          id,
          title,
          description,
          weight,
          order_index,
          firm_questions (
            id,
            requirement_id,
            question,
            guidance,
            scoring_type,
            weight,
            mandatory,
            order_index
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (fData) {
      const sections: ChecklistSection[] = (fData.firm_sections || [])
        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        .map((sec: any) => ({
          id: sec.id,
          title: sec.title || "",
          description: sec.description || "",
          weight: Number(sec.weight) || 100,
          questions: (sec.firm_questions || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((q: any) => ({
              id: q.id,
              requirementId: q.requirement_id || "",
              question: q.question || "",
              guidance: q.guidance || "",
              scoringType: (q.scoring_type as any) || "PASS_FAIL",
              weight: Number(q.weight) || 10,
              mandatory: Boolean(q.mandatory),
            })),
        }));

      return {
        id: fData.id,
        code: fData.code,
        title: fData.title,
        standard: fData.standard,
        industry: fData.industry || "General Industry",
        version: fData.version || "1.0",
        passingScore: Number(fData.passing_score) || 80,
        tags: fData.tags || [],
        description: fData.description || "",
        isDefaultIndustryTemplate: false,
        isCustom: true,
        firmId: fData.firm_id,
        globalTemplateId: fData.global_template_id,
        sections,
        createdAt: fData.created_on || fData.created_at?.split("T")[0] || "",
        updatedAt: fData.last_modified_at?.split("T")[0] || "",
      };
    }

    // 2. Check global_templates
    const { data: gData, error: gError } = await supabaseAdmin
      .from("global_templates")
      .select(`
        id,
        code,
        title,
        standard,
        industry,
        version,
        passing_score,
        tags,
        description,
        is_active,
        created_at,
        created_on,
        last_modified_at,
        global_sections (
          id,
          title,
          description,
          weight,
          order_index,
          global_questions (
            id,
            requirement_id,
            question,
            guidance,
            scoring_type,
            weight,
            mandatory,
            order_index
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (gData) {
      const sections: ChecklistSection[] = (gData.global_sections || [])
        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        .map((sec: any) => ({
          id: sec.id,
          title: sec.title || "",
          description: sec.description || "",
          weight: Number(sec.weight) || 100,
          questions: (sec.global_questions || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((q: any) => ({
              id: q.id,
              requirementId: q.requirement_id || "",
              question: q.question || "",
              guidance: q.guidance || "",
              scoringType: (q.scoring_type as any) || "PASS_FAIL",
              weight: Number(q.weight) || 10,
              mandatory: Boolean(q.mandatory),
            })),
        }));

      return {
        id: gData.id,
        code: gData.code,
        title: gData.title,
        standard: gData.standard,
        industry: gData.industry || "General Industry",
        version: gData.version || "1.0",
        passingScore: Number(gData.passing_score) || 80,
        tags: gData.tags || [],
        description: gData.description || "",
        isDefaultIndustryTemplate: true,
        isCustom: false,
        sections,
        createdAt: gData.created_on || gData.created_at?.split("T")[0] || "",
        updatedAt: gData.last_modified_at?.split("T")[0] || "",
      };
    }

    throw new ApiError(404, `Template with ID '${id}' was not found.`);
  },

  /**
   * Creates a new template in Supabase.
   * If `globalTemplateId` is specified without custom sections, clones the global template hierarchy.
   * Otherwise creates a new custom firm template with the provided sections and clauses.
   */
  async createTemplate(input: CreateTemplateInput): Promise<AuditTemplate> {
    let targetFirmId = input.firmId || input.firm_id;
    if (!targetFirmId) {
      const { data: firstFirm } = await supabaseAdmin.from("firm").select("id").limit(1).maybeSingle();
      if (!firstFirm) {
        throw new ApiError(400, "A valid firm ID is required to create or link a template.");
      }
      targetFirmId = firstFirm.id;
    }

    const globalTemplateId = input.globalTemplateId || input.global_template_id;

    // SCENARIO A: Linking / Cloning an existing Global Template into a Firm Template
    if (globalTemplateId && (!input.sections || input.sections.length === 0)) {
      const { data: globalTmpl, error: gErr } = await supabaseAdmin
        .from("global_templates")
        .select(`
          id,
          code,
          title,
          standard,
          industry,
          version,
          passing_score,
          tags,
          description,
          global_sections (
            id,
            title,
            description,
            weight,
            order_index,
            global_questions (
              id,
              requirement_id,
              question,
              guidance,
              scoring_type,
              weight,
              mandatory,
              order_index
            )
          )
        `)
        .eq("id", globalTemplateId)
        .single();

      if (gErr || !globalTmpl) {
        throw new ApiError(404, `Global template '${globalTemplateId}' not found.`);
      }

      // Check if firm already has this template linked
      const { data: existingLink } = await supabaseAdmin
        .from("firm_templates")
        .select("id")
        .eq("firm_id", targetFirmId)
        .eq("global_template_id", globalTemplateId)
        .maybeSingle();

      if (existingLink) {
        return this.getTemplateById(existingLink.id);
      }

      const generatedCode = `${globalTmpl.code}-${Date.now().toString().slice(-4)}`;
      const firmTemplateId = `ftmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const { error: ftErr } = await supabaseAdmin.from("firm_templates").insert({
        id: firmTemplateId,
        firm_id: targetFirmId,
        global_template_id: globalTemplateId,
        code: input.code || generatedCode,
        title: input.title || globalTmpl.title,
        standard: input.standard || globalTmpl.standard,
        industry: input.industry || globalTmpl.industry,
        version: input.version || globalTmpl.version,
        passing_score: input.passingScore ?? input.passing_score ?? globalTmpl.passing_score,
        tags: input.tags?.length ? input.tags : globalTmpl.tags,
        description: input.description || globalTmpl.description,
        is_custom: true,
        is_active: true,
      });

      if (ftErr) {
        throw new ApiError(500, `Failed to create firm template: ${ftErr.message}`);
      }

      // Clone sections and questions
      if (globalTmpl.global_sections && globalTmpl.global_sections.length > 0) {
        for (const gSec of globalTmpl.global_sections) {
          const firmSectionId = `fsec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await supabaseAdmin.from("firm_sections").insert({
            id: firmSectionId,
            firm_template_id: firmTemplateId,
            global_section_id: gSec.id,
            title: gSec.title,
            description: gSec.description,
            weight: gSec.weight,
            order_index: gSec.order_index,
          });

          if (gSec.global_questions && gSec.global_questions.length > 0) {
            const fqRows = gSec.global_questions.map((gq: any, idx: number) => ({
              id: `fq_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
              firm_section_id: firmSectionId,
              global_question_id: gq.id,
              requirement_id: gq.requirement_id,
              question: gq.question,
              guidance: gq.guidance,
              scoring_type: gq.scoring_type,
              weight: gq.weight,
              mandatory: gq.mandatory,
              order_index: gq.order_index,
            }));
            await supabaseAdmin.from("firm_questions").insert(fqRows);
          }
        }
      }

      return this.getTemplateById(firmTemplateId);
    }

    // SCENARIO B: Creating a Custom Firm Template with Sections & Clauses
    const firmTemplateId = `ftmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const templateCode = input.code || `TMPL-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error: ftErr } = await supabaseAdmin.from("firm_templates").insert({
      id: firmTemplateId,
      firm_id: targetFirmId,
      global_template_id: globalTemplateId || null,
      code: templateCode,
      title: input.title || "Custom Audit Framework",
      standard: input.standard || input.code || "Custom Standard",
      industry: input.industry || "General Industry",
      version: input.version || "1.0",
      passing_score: input.passingScore ?? input.passing_score ?? 80,
      tags: input.tags || ["Custom", input.standard || "Proprietary"],
      description: input.description || `Custom compliance template provisioned for firm.`,
      is_custom: true,
      is_active: true,
    });

    if (ftErr) {
      throw new ApiError(500, `Failed to create custom firm template: ${ftErr.message}`);
    }

    // Insert sections and questions
    const sectionsToCreate: TemplateSectionInput[] =
      input.sections && input.sections.length > 0
        ? input.sections
        : [
            {
              title: "Section 1: General & Management Governance",
              description: "Core organizational governance and compliance procedures.",
              weight: 100,
              orderIndex: 1,
              questions: [
                {
                  requirementId: "1.1",
                  question: "Is the management policy and quality manual documented and communicated?",
                  guidance: "Review documented management policies, quality manuals, and employee training records.",
                  scoringType: "PASS_FAIL" as const,
                  weight: 10,
                  mandatory: true,
                  orderIndex: 1,
                },
                {
                  requirementId: "1.2",
                  question: "Are operational procedures periodically reviewed with objective verification records?",
                  guidance: "Inspect internal audit records and operational review logs.",
                  scoringType: "PASS_FAIL" as const,
                  weight: 10,
                  mandatory: false,
                  orderIndex: 2,
                },
              ],
            },
          ];

    for (let sIdx = 0; sIdx < sectionsToCreate.length; sIdx++) {
      const sec = sectionsToCreate[sIdx];
      const firmSectionId = `fsec_${Date.now()}_${sIdx}_${Math.random().toString(36).substring(2, 6)}`;

      await supabaseAdmin.from("firm_sections").insert({
        id: firmSectionId,
        firm_template_id: firmTemplateId,
        global_section_id: sec.globalSectionId || sec.global_section_id || null,
        title: sec.title,
        description: sec.description || "",
        weight: sec.weight || 100,
        order_index: sec.orderIndex ?? sec.order_index ?? sIdx + 1,
      });

      if (sec.questions && sec.questions.length > 0) {
        const questionsToInsert = sec.questions.map((q, qIdx) => ({
          id: `fq_${Date.now()}_${sIdx}_${qIdx}_${Math.random().toString(36).substring(2, 6)}`,
          firm_section_id: firmSectionId,
          global_question_id: q.globalQuestionId || q.global_question_id || null,
          requirement_id: q.requirementId || q.requirement_id || `${sIdx + 1}.${qIdx + 1}`,
          question: q.question,
          guidance: q.guidance || "Verify objective documentary evidence and operational records.",
          scoring_type: q.scoringType || q.scoring_type || "PASS_FAIL",
          weight: q.weight || 10,
          mandatory: Boolean(q.mandatory),
          order_index: q.orderIndex ?? q.order_index ?? qIdx + 1,
        }));

        await supabaseAdmin.from("firm_questions").insert(questionsToInsert);
      }
    }

    return this.getTemplateById(firmTemplateId);
  },

  /**
   * Updates an existing template in Supabase.
   */
  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<AuditTemplate> {
    // Check if firm template exists
    const { data: fTmpl } = await supabaseAdmin.from("firm_templates").select("id").eq("id", id).maybeSingle();

    if (fTmpl) {
      const updatePayload: Record<string, any> = {
        last_modified_at: new Date().toISOString(),
        last_modified_on: new Date().toISOString().split("T")[0],
      };

      if (input.title !== undefined) updatePayload.title = input.title;
      if (input.code !== undefined) updatePayload.code = input.code;
      if (input.standard !== undefined) updatePayload.standard = input.standard;
      if (input.industry !== undefined) updatePayload.industry = input.industry;
      if (input.version !== undefined) updatePayload.version = input.version;
      if (input.passingScore !== undefined || input.passing_score !== undefined) {
        updatePayload.passing_score = input.passingScore ?? input.passing_score;
      }
      if (input.tags !== undefined) updatePayload.tags = input.tags;
      if (input.description !== undefined) updatePayload.description = input.description;
      if (input.isActive !== undefined || input.is_active !== undefined) {
        updatePayload.is_active = input.isActive ?? input.is_active;
      }

      const { error: updErr } = await supabaseAdmin.from("firm_templates").update(updatePayload).eq("id", id);
      if (updErr) {
        throw new ApiError(500, `Failed to update firm template: ${updErr.message}`);
      }

      // If sections are provided, replace sections and questions
      if (input.sections && Array.isArray(input.sections)) {
        await supabaseAdmin.from("firm_sections").delete().eq("firm_template_id", id);

        for (let sIdx = 0; sIdx < input.sections.length; sIdx++) {
          const sec = input.sections[sIdx];
          const firmSectionId = `fsec_${Date.now()}_${sIdx}_${Math.random().toString(36).substring(2, 6)}`;

          await supabaseAdmin.from("firm_sections").insert({
            id: firmSectionId,
            firm_template_id: id,
            global_section_id: sec.globalSectionId || sec.global_section_id || null,
            title: sec.title,
            description: sec.description || "",
            weight: sec.weight || 100,
            order_index: sec.orderIndex ?? sec.order_index ?? sIdx + 1,
          });

          if (sec.questions && sec.questions.length > 0) {
            const questionsToInsert = sec.questions.map((q, qIdx) => ({
              id: `fq_${Date.now()}_${sIdx}_${qIdx}_${Math.random().toString(36).substring(2, 6)}`,
              firm_section_id: firmSectionId,
              global_question_id: q.globalQuestionId || q.global_question_id || null,
              requirement_id: q.requirementId || q.requirement_id || `${sIdx + 1}.${qIdx + 1}`,
              question: q.question,
              guidance: q.guidance || "Verify objective documentary evidence and operational records.",
              scoring_type: q.scoringType || q.scoring_type || "PASS_FAIL",
              weight: q.weight || 10,
              mandatory: Boolean(q.mandatory),
              order_index: q.orderIndex ?? q.order_index ?? qIdx + 1,
            }));

            await supabaseAdmin.from("firm_questions").insert(questionsToInsert);
          }
        }
      }

      return this.getTemplateById(id);
    }

    // Check if global template exists
    const { data: gTmpl } = await supabaseAdmin.from("global_templates").select("id").eq("id", id).maybeSingle();
    if (gTmpl) {
      const updatePayload: Record<string, any> = {
        last_modified_at: new Date().toISOString(),
        last_modified_on: new Date().toISOString().split("T")[0],
      };

      if (input.title !== undefined) updatePayload.title = input.title;
      if (input.code !== undefined) updatePayload.code = input.code;
      if (input.standard !== undefined) updatePayload.standard = input.standard;
      if (input.industry !== undefined) updatePayload.industry = input.industry;
      if (input.version !== undefined) updatePayload.version = input.version;
      if (input.passingScore !== undefined || input.passing_score !== undefined) {
        updatePayload.passing_score = input.passingScore ?? input.passing_score;
      }
      if (input.tags !== undefined) updatePayload.tags = input.tags;
      if (input.description !== undefined) updatePayload.description = input.description;
      if (input.isActive !== undefined || input.is_active !== undefined) {
        updatePayload.is_active = input.isActive ?? input.is_active;
      }

      const { error: updErr } = await supabaseAdmin.from("global_templates").update(updatePayload).eq("id", id);
      if (updErr) {
        throw new ApiError(500, `Failed to update global template: ${updErr.message}`);
      }

      return this.getTemplateById(id);
    }

    throw new ApiError(404, `Template with ID '${id}' not found.`);
  },

  /**
   * Deletes a template from Supabase.
   */
  async deleteTemplate(id: string): Promise<{ success: boolean; message: string }> {
    // Check if it is a firm template
    const { data: fTmpl } = await supabaseAdmin.from("firm_templates").select("id, title").eq("id", id).maybeSingle();

    if (fTmpl) {
      const { error: delErr } = await supabaseAdmin.from("firm_templates").delete().eq("id", id);
      if (delErr) {
        throw new ApiError(500, `Failed to delete firm template: ${delErr.message}`);
      }
      return { success: true, message: `Firm template "${fTmpl.title || id}" deleted successfully.` };
    }

    // If global template, mark as inactive rather than hard deleting to preserve referential integrity
    const { data: gTmpl } = await supabaseAdmin.from("global_templates").select("id, title").eq("id", id).maybeSingle();
    if (gTmpl) {
      const { error: delErr } = await supabaseAdmin.from("global_templates").update({ is_active: false }).eq("id", id);
      if (delErr) {
        throw new ApiError(500, `Failed to deactivate global template: ${delErr.message}`);
      }
      return { success: true, message: `Global template "${gTmpl.title || id}" deactivated successfully.` };
    }

    throw new ApiError(404, `Template with ID '${id}' not found.`);
  },
};

export default templateBackendService;
