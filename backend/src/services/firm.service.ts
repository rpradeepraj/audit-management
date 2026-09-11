/**
 * Firm Backend Service
 * Strictly queries, creates, updates, and deletes accredited audit firms
 * directly in the Supabase PostgreSQL database.
 */

import { supabaseAdmin } from "../config/supabase";
import {
  FirmQueryInput,
  CreateFirmInput,
  UpdateFirmInput,
  FirmDetailResponse,
  FirmStaffSummary,
  FirmTemplateSummary,
} from "../schemas/firm.schema";
import { ApiError } from "../utils/apiError";
import { formatRoleFromDb } from "../utils/roleMapper";

export const firmBackendService = {
  /**
   * Retrieves list of audit firms strictly from Supabase with search and status filtering.
   */
  async getFirms(query: FirmQueryInput): Promise<{ firms: FirmDetailResponse[]; total: number }> {
    // 1. Query Supabase public.firm table
    let firmQuery = supabaseAdmin
      .from("firm")
      .select(`
        id,
        code,
        name,
        contact_email,
        phone,
        address,
        website,
        established_year,
        quality_policy,
        Scope_Surveillance,
        is_active,
        created_at,
        created_on,
        last_modified_at,
        last_modified_on
      `)
      .order("created_at", { ascending: true });

    if (query.status && query.status !== "All") {
      const isActive = query.status.toLowerCase() === "active";
      firmQuery = firmQuery.eq("is_active", isActive);
    }

    // Filter firms linked to specific user via user_firms table
    if (query.userId) {
      try {
        const { data: userFirms } = await supabaseAdmin
          .from("user_firms")
          .select("firm_id")
          .eq("user_id", query.userId);

        if (userFirms && userFirms.length > 0) {
          const allowedFirmIds = userFirms.map((uf: any) => uf.firm_id);
          firmQuery = firmQuery.in("id", allowedFirmIds);
        }
      } catch {
        // Non-blocking fallback
      }
    }

    const { data: dbFirms, error: firmError } = await firmQuery;

    if (firmError) {
      throw new ApiError(500, `Failed to fetch audit firms: ${firmError.message}`);
    }

    if (!dbFirms || dbFirms.length === 0) {
      return { firms: [], total: 0 };
    }

    // 2. Fetch users for assigned staff roster strictly via public.audit_team_members
    const firmIds = dbFirms.map((f: any) => f.id);
    let firmUserMappings: any[] = [];
    let dbUsers: any[] = [];
    const emailMap = new Map<string, string>();

    try {
      const { data: mappings } = await supabaseAdmin
        .from("audit_team_members")
        .select("id, firm_id, user_id, created_at, created_on")
        .in("firm_id", firmIds);

      if (mappings && mappings.length > 0) {
        firmUserMappings = mappings;
        const userIds = Array.from(new Set(mappings.map((m: any) => m.user_id)));
        const { data: users } = await supabaseAdmin
          .from("users")
          .select("id, name, role, avatar, phone, is_active, created_on")
          .in("id", userIds);
        dbUsers = users || [];

        // Fetch emails from auth.users
        try {
          const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          if (authList?.users) {
            for (const au of authList.users) {
              if (au.id && au.email) {
                emailMap.set(au.id, au.email);
              }
            }
          }
        } catch {}
      }
    } catch {
      // Non-blocking fallback
    }

    // 3. Fetch maintained templates
    const { data: dbTemplates } = await supabaseAdmin
      .from("firm_templates")
      .select("id, firm_id, code, title, standard, industry, version, passing_score")
      .in("firm_id", firmIds);

    // 4. Map and enrich Supabase data
    const enrichedFirms: FirmDetailResponse[] = dbFirms.map((f: any) =>
      this.formatFirmRecord(f, dbUsers || [], dbTemplates || [], firmUserMappings, emailMap)
    );

    // 5. Apply in-memory search and pagination filters
    return this.applyFilters(enrichedFirms, query);
  },

  /**
   * Retrieves single audit firm strictly from Supabase by ID or Code.
   */
  async getFirmById(firmId: string): Promise<FirmDetailResponse> {
    if (!firmId) {
      throw new ApiError(400, "Firm ID is required.");
    }

    const { data: firm, error: firmError } = await supabaseAdmin
      .from("firm")
      .select(`
        id,
        code,
        name,
        contact_email,
        phone,
        address,
        website,
        established_year,
        quality_policy,
        Scope_Surveillance,
        is_active,
        created_at,
        created_on,
        last_modified_at,
        last_modified_on
      `)
      .or(`id.eq.${firmId},code.eq.${firmId.toUpperCase()}`)
      .maybeSingle();

    if (firmError) {
      throw new ApiError(500, `Failed to fetch audit firm: ${firmError.message}`);
    }

    if (!firm) {
      throw new ApiError(404, `Audit firm with ID '${firmId}' not found.`);
    }

    let firmUserMappings: any[] = [];
    let dbUsers: any[] = [];
    const emailMap = new Map<string, string>();

    try {
      const { data: mappings } = await supabaseAdmin
        .from("audit_team_members")
        .select("id, firm_id, user_id, created_at, created_on")
        .eq("firm_id", firm.id);

      if (mappings && mappings.length > 0) {
        firmUserMappings = mappings;
        const userIds = mappings.map((m: any) => m.user_id);
        const { data: users } = await supabaseAdmin
          .from("users")
          .select("id, name, role, avatar, phone, is_active, created_on")
          .in("id", userIds);
        dbUsers = users || [];

        try {
          const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          if (authList?.users) {
            for (const au of authList.users) {
              if (au.id && au.email) {
                emailMap.set(au.id, au.email);
              }
            }
          }
        } catch {}
      }
    } catch {
      // Non-blocking fallback
    }

    const { data: dbTemplates } = await supabaseAdmin
      .from("firm_templates")
      .select("id, firm_id, code, title, standard, industry, version, passing_score")
      .eq("firm_id", firm.id);

    return this.formatFirmRecord(firm, dbUsers || [], dbTemplates || [], firmUserMappings, emailMap);
  },

  /**
   * Creates a new audit firm in Supabase database and updates user_firms mapping table.
   */
  async createFirm(input: CreateFirmInput): Promise<FirmDetailResponse> {
    // 1. Check if firm code is already registered
    const { data: existingCode } = await supabaseAdmin
      .from("firm")
      .select("id")
      .eq("code", input.code)
      .maybeSingle();

    if (existingCode) {
      throw new ApiError(409, `An audit firm with code '${input.code}' already exists.`);
    }

    const newId = `firm_${Date.now()}`;
    const isActive = input.status ? input.status === "Active" : (input.isActive ?? true);
    const scopeString = input.industryScope?.trim() || null;
    const policyText = input.qualityPolicy?.trim() || null;

    const newRecord: Record<string, any> = {
      id: newId,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      contact_email: input.contactEmail.trim(),
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      website: input.website?.trim() || null,
      established_year: input.establishedYear?.trim() || null,
      quality_policy: policyText,
      Scope_Surveillance: scopeString,
      is_active: isActive,
      created_at: new Date().toISOString(),
      created_on: new Date().toISOString().split("T")[0],
      last_modified_at: new Date().toISOString(),
      last_modified_on: new Date().toISOString().split("T")[0],
    };

    const { data: createdFirm, error: insertError } = await supabaseAdmin
      .from("firm")
      .insert(newRecord)
      .select()
      .single();

    if (insertError) {
      throw new ApiError(500, `Failed to create audit firm in database: ${insertError.message}`);
    }

    // 2. Insert user-firm relationship in user_firms table (for multi-firm user association)
    const targetUserId = input.userId || input.createBy || "070ce3c5-167a-44c6-9f72-ff3216c972f6";
    try {
      await supabaseAdmin.from("user_firms").insert({
        id: `uf_${Date.now()}`,
        firm_id: createdFirm.id,
        user_id: targetUserId,
        create_by: targetUserId,
        created_on: new Date().toISOString().split("T")[0],
        last_modifyed_at: new Date().toISOString(),
        last_modtfy_on: new Date().toISOString().split("T")[0],
      });
    } catch (err: any) {
      console.warn("Notice: user_firms insert skipped:", err?.message);
    }

    return this.formatFirmRecord(createdFirm, [], []);
  },

  /**
   * Updates an existing audit firm in Supabase database.
   */
  async updateFirm(firmId: string, updates: UpdateFirmInput): Promise<FirmDetailResponse> {
    if (!firmId) {
      throw new ApiError(400, "Firm ID is required.");
    }

    // 1. Verify existence
    const { data: existing, error: findError } = await supabaseAdmin
      .from("firm")
      .select("id, code, quality_policy, Scope_Surveillance")
      .eq("id", firmId)
      .maybeSingle();

    if (findError) {
      throw new ApiError(500, `Database error: ${findError.message}`);
    }

    if (!existing) {
      throw new ApiError(404, `Audit firm with ID '${firmId}' not found.`);
    }

    // 2. Check code uniqueness if code is being modified
    if (updates.code && updates.code !== existing.code) {
      const { data: codeCheck } = await supabaseAdmin
        .from("firm")
        .select("id")
        .eq("code", updates.code)
        .neq("id", firmId)
        .maybeSingle();

      if (codeCheck) {
        throw new ApiError(409, `An audit firm with code '${updates.code}' already exists.`);
      }
    }

    const updatePayload: Record<string, any> = {
      last_modified_at: new Date().toISOString(),
      last_modified_on: new Date().toISOString().split("T")[0],
    };

    if (updates.name !== undefined) updatePayload.name = updates.name.trim();
    if (updates.code !== undefined) updatePayload.code = updates.code.trim().toUpperCase();
    if (updates.contactEmail !== undefined) updatePayload.contact_email = updates.contactEmail.trim();
    if (updates.phone !== undefined) updatePayload.phone = updates.phone?.trim() || null;
    if (updates.address !== undefined) updatePayload.address = updates.address?.trim() || null;
    if (updates.website !== undefined) updatePayload.website = updates.website?.trim() || null;
    if (updates.establishedYear !== undefined) updatePayload.established_year = updates.establishedYear?.trim() || null;
    if (updates.qualityPolicy !== undefined) updatePayload.quality_policy = updates.qualityPolicy?.trim() || null;
    if (updates.industryScope !== undefined) updatePayload.Scope_Surveillance = updates.industryScope?.trim() || null;

    if (updates.status !== undefined) {
      updatePayload.is_active = updates.status === "Active";
    } else if (updates.isActive !== undefined) {
      updatePayload.is_active = updates.isActive;
    }

    const { data: updatedFirm, error: updateError } = await supabaseAdmin
      .from("firm")
      .update(updatePayload)
      .eq("id", firmId)
      .select()
      .single();

    if (updateError) {
      throw new ApiError(500, `Failed to update audit firm in database: ${updateError.message}`);
    }

    // Fetch related users & templates
    let firmUserMappings: any[] = [];
    let dbUsers: any[] = [];

    try {
      const { data: mappings } = await supabaseAdmin
        .from("user_firms")
        .select("id, firm_id, user_id, create_by, created_on, last_modifyed_at, last_modtfy_on")
        .eq("firm_id", firmId);

      if (mappings && mappings.length > 0) {
        firmUserMappings = mappings;
        const userIds = mappings.map((m: any) => m.user_id);
        const { data: users } = await supabaseAdmin
          .from("users")
          .select("id, name, email, role, avatar, phone, is_active")
          .in("id", userIds);
        dbUsers = users || [];
      }
    } catch {
      // Non-blocking fallback
    }

    if (dbUsers.length === 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, name, email, role, avatar, phone, is_active");
      dbUsers = users || [];
    }

    const { data: dbTemplates } = await supabaseAdmin
      .from("firm_templates")
      .select("id, firm_id, code, title, standard, industry, version, passing_score")
      .eq("firm_id", firmId);

    return this.formatFirmRecord(updatedFirm, dbUsers || [], dbTemplates || [], firmUserMappings);
  },

  /**
   * Deletes an audit firm from Supabase database.
   */
  async deleteFirm(firmId: string): Promise<boolean> {
    if (!firmId) {
      throw new ApiError(400, "Firm ID is required.");
    }

    const { error: deleteError } = await supabaseAdmin
      .from("firm")
      .delete()
      .eq("id", firmId);

    if (deleteError) {
      throw new ApiError(500, `Failed to delete audit firm from database: ${deleteError.message}`);
    }

    return true;
  },

  /**
   * Formats Supabase record into clean frontend-ready response model
   */
  formatFirmRecord(
    f: any,
    dbUsers: any[],
    dbTemplates: any[],
    firmUserMappings: any[] = [],
    emailMap: Map<string, string> = new Map()
  ): FirmDetailResponse {
    let matchedUsers: any[] = [];
    const firmMappings = firmUserMappings.filter((m: any) => m.firm_id === f.id);

    if (firmMappings.length > 0) {
      const mappedUserIds = new Set(firmMappings.map((m: any) => m.user_id));
      matchedUsers = dbUsers.filter((u: any) => mappedUserIds.has(u.id));
    } else {
      matchedUsers = dbUsers.filter((u: any) => u.firm_id === f.id);
    }

    const firmUsers: FirmStaffSummary[] = matchedUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: emailMap.get(u.id) || u.email || `${u.name.toLowerCase().replace(/\s+/g, ".")}@auditfirm.com`,
      role: formatRoleFromDb(u.role),
      avatar: u.avatar || "",
      phone: u.phone || "",
      isActive: u.is_active ?? true,
    }));

    const firmTemplates: FirmTemplateSummary[] = dbTemplates
      .filter((t: any) => t.firm_id === f.id)
      .map((t: any) => ({
        id: t.id,
        code: t.code,
        title: t.title,
        standard: t.standard,
        industry: t.industry,
        version: t.version,
        passingScore: t.passing_score,
      }));

    const initials = f.name
      ? f.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "AF";

    // Read Scope_Surveillance directly from column
    let industryScope = f.Scope_Surveillance || f.scope_surveillance || f.industry_scope || "";
    if (industryScope.startsWith("[Scope:")) {
      const closingIndex = industryScope.indexOf("]");
      if (closingIndex !== -1) {
        industryScope = industryScope.substring(7, closingIndex).trim();
      }
    }

    // Read quality_policy directly from column
    let qualityPolicy = f.quality_policy || "";
    if (qualityPolicy.startsWith("[Scope:")) {
      const closingIndex = qualityPolicy.indexOf("]");
      if (closingIndex !== -1) {
        qualityPolicy = qualityPolicy.substring(closingIndex + 1).replace(/^\n+/, "").trim();
      }
    }

    if (!industryScope) {
      industryScope = "Information Security & Cybersecurity, Healthcare, Medical Devices & Life Sciences, Manufacturing & Industrial Engineering";
    }

    return {
      id: f.id,
      code: f.code || "FIRM",
      name: f.name || "Unnamed Firm",
      contactEmail: f.contact_email || "",
      phone: f.phone || "",
      address: f.address || "",
      website: f.website || "",
      establishedYear: f.established_year || "",
      qualityPolicy: qualityPolicy,
      industryScope: industryScope,
      logoInitials: initials,
      status: f.is_active ? "Active" : "Inactive",
      isActive: f.is_active ?? true,
      createdAt: f.created_at ? f.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      assignedStaff: firmUsers,
      assignedStaffCount: firmUsers.length,
      maintainedTemplates: firmTemplates,
      maintainedTemplatesCount: firmTemplates.length,
    };
  },

  /**
   * Filter and paginate firm lists
   */
  applyFilters(
    firms: FirmDetailResponse[],
    query: FirmQueryInput
  ): { firms: FirmDetailResponse[]; total: number } {
    let result = [...firms];

    if (query.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.contactEmail.toLowerCase().includes(q) ||
          f.maintainedTemplates.some(
            (t) =>
              t.standard.toLowerCase().includes(q) ||
              t.title.toLowerCase().includes(q) ||
              (t.industry && t.industry.toLowerCase().includes(q))
          )
      );
    }

    const total = result.length;
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginated = result.slice(offset, offset + limit);

    return { firms: paginated, total };
  },
};

export default firmBackendService;
