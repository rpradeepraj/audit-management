import { supabaseAdmin } from "../config/supabase";
import { CreateUserInput, UpdateUserInput, UserQueryInput } from "../schemas/user.schema";
import { ApiError } from "../utils/apiError";
import { normalizeRoleForDb, formatRoleFromDb } from "../utils/roleMapper";

export interface FormattedUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  status: "Active" | "Inactive";
  joinedDate: string;
  firmId?: string | null;
  firmName?: string | null;
  department?: string | null;
  firms?: Array<{ id: string; name: string; code: string }>;
}

export const userBackendService = {
  /**
   * Retrieves users from Supabase with optional search, role, and firm filtering.
   */
  async getUsers(query: UserQueryInput): Promise<{ users: FormattedUserResponse[]; total: number }> {
    try {
      let userIds: string[] | null = null;

      // 1. Filter by firm strictly via public.audit_team_members if firmId specified
      if (query.firmId) {
        const { data: atmData, error: atmError } = await supabaseAdmin
          .from("audit_team_members")
          .select("user_id")
          .eq("firm_id", query.firmId);

        if (atmError) {
          console.error("Error querying audit_team_members for firmId:", atmError);
        }

        const atmIds = (atmData || []).map((x) => x.user_id);

        if (atmIds.length === 0) {
          return { users: [], total: 0 };
        }
        userIds = atmIds;
      }

      // 2. Query public.users
      let dbQuery = supabaseAdmin
        .from("users")
        .select(`
          id,
          name,
          role,
          phone,
          avatar,
          is_active,
          created_at,
          created_on
        `, { count: "exact" });

      if (userIds && userIds.length > 0) {
        dbQuery = dbQuery.in("id", userIds);
      }

      if (query.role && query.role !== "All" && query.role !== "ALL") {
        const dbRole = normalizeRoleForDb(query.role);
        dbQuery = dbQuery.eq("role", dbRole);
      }

      if (query.search && query.search.trim()) {
        const searchTerm = `%${query.search.trim()}%`;
        dbQuery = dbQuery.or(`name.ilike.${searchTerm},phone.ilike.${searchTerm}`);
      }

      dbQuery = dbQuery.order("created_at", { ascending: false });

      const page = query.page || 1;
      const limit = query.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      dbQuery = dbQuery.range(from, to);

      const { data: usersData, error: usersError, count } = await dbQuery;

      if (usersError) {
        console.error("Error fetching users from Supabase:", usersError);
        throw new ApiError(500, `Failed to load users: ${usersError.message}`);
      }

      // 3. Fetch auth.users to map emails
      const emailMap = new Map<string, string>();
      try {
        const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
        if (authList?.users) {
          for (const au of authList.users) {
            if (au.id && au.email) {
              emailMap.set(au.id, au.email);
            }
          }
        }
      } catch (authErr) {
        console.warn("Could not list auth users:", authErr);
      }

      // 4. Fetch audit_team_members associations to enrich users with their firms
      const fetchedUserIds = (usersData || []).map((u) => u.id);
      const firmMap = new Map<string, Array<{ id: string; name: string; code: string }>>();

      if (fetchedUserIds.length > 0) {
        const { data: atmList } = await supabaseAdmin
          .from("audit_team_members")
          .select(`
            user_id,
            firm:firm_id (
              id,
              name,
              code
            )
          `)
          .in("user_id", fetchedUserIds);

        if (atmList) {
          for (const atm of atmList) {
            const firmData = Array.isArray(atm.firm) ? atm.firm[0] : atm.firm;
            if (firmData) {
              const existing = firmMap.get(atm.user_id) || [];
              if (!existing.some((f) => f.id === (firmData as any).id)) {
                existing.push(firmData as any);
                firmMap.set(atm.user_id, existing);
              }
            }
          }
        }
      }

      const formatted: FormattedUserResponse[] = (usersData || []).map((u) => {
        const userFirmList = firmMap.get(u.id) || [];
        const primaryFirm = userFirmList[0] || null;

        return {
          id: u.id,
          name: u.name,
          email: emailMap.get(u.id) || `${u.name.toLowerCase().replace(/\s+/g, ".")}@auditfirm.com`,
          role: formatRoleFromDb(u.role),
          phone: u.phone || "",
          avatar: u.avatar || "",
          status: u.is_active ? "Active" : "Inactive",
          joinedDate: u.created_on || (u.created_at ? u.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
          firmId: primaryFirm?.id || null,
          firmName: primaryFirm?.name || null,
          firms: userFirmList,
        };
      });

      return {
        users: formatted,
        total: count || formatted.length,
      };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      console.error("Unexpected error in getUsers:", err);
      throw new ApiError(500, err.message || "Failed to load users");
    }
  },

  /**
   * Retrieves single user by ID.
   */
  async getUserById(id: string): Promise<FormattedUserResponse> {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        name,
        role,
        phone,
        avatar,
        is_active,
        created_at,
        created_on
      `)
      .eq("id", id)
      .single();

    if (error || !user) {
      throw new ApiError(404, `User with ID '${id}' not found.`);
    }

    let email = "";
    try {
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(id);
      if (authUserData?.user?.email) {
        email = authUserData.user.email;
      }
    } catch {
      email = `${user.name.toLowerCase().replace(/\s+/g, ".")}@auditfirm.com`;
    }

    const { data: ufList } = await supabaseAdmin
      .from("user_firms")
      .select(`
        firm:firm_id (
          id,
          name,
          code
        )
      `)
      .eq("user_id", id);

    const userFirmList: Array<{ id: string; name: string; code: string }> = (ufList || [])
      .map((uf: any) => (Array.isArray(uf.firm) ? uf.firm[0] : uf.firm))
      .filter(Boolean);

    return {
      id: user.id,
      name: user.name,
      email: email || `${user.name.toLowerCase().replace(/\s+/g, ".")}@auditfirm.com`,
      role: formatRoleFromDb(user.role),
      phone: user.phone || "",
      avatar: user.avatar || "",
      status: user.is_active ? "Active" : "Inactive",
      joinedDate: user.created_on || (user.created_at ? user.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
      firmId: userFirmList[0]?.id || null,
      firmName: userFirmList[0]?.name || null,
      firms: userFirmList,
    };
  },

  /**
   * Creates a user in Supabase:
   * 1. auth.users (Supabase Auth account with email & password)
   * 2. public.users (Platform profile)
   * 3. public.user_firms (Firm association)
   * 4. public.audit_team_members (Optional audit assignment)
   */
  async createUser(input: CreateUserInput, creatorId?: string): Promise<FormattedUserResponse> {
    const email = input.email.trim().toLowerCase();
    const userPassword = input.password && input.password.length >= 6 ? input.password : "Password@123";
    let authUserId: string | null = null;

    // 1. Create or sync Supabase Auth user in auth.users
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          name: input.name.trim(),
          role: input.role,
          phone: input.phone || "",
          avatar: input.avatar || "",
        },
      });

      if (!authError && authUser?.user) {
        authUserId = authUser.user.id;
      } else if (authError) {
        const isEmailExists =
          authError.code === "email_exists" ||
          authError.status === 422 ||
          authError.message?.toLowerCase().includes("already been registered") ||
          authError.message?.toLowerCase().includes("already exists");

        if (isEmailExists) {
          // If user already exists in auth.users, find their auth ID across pages
          let page = 1;
          let foundUser: any = null;
          while (page <= 5 && !foundUser) {
            const { data: existingAuthList } = await supabaseAdmin.auth.admin.listUsers({
              page,
              perPage: 100,
            });
            if (!existingAuthList?.users || existingAuthList.users.length === 0) break;
            foundUser = existingAuthList.users.find(
              (u: any) => u.email?.toLowerCase() === email
            );
            page++;
          }

          if (foundUser) {
            authUserId = foundUser.id;
            // Update password and metadata
            await supabaseAdmin.auth.admin.updateUserById(foundUser.id, {
              password: userPassword,
              user_metadata: {
                name: input.name.trim(),
                role: input.role,
                phone: input.phone || "",
                avatar: input.avatar || "",
              },
            });
          } else {
            throw new ApiError(400, `A user with email "${email}" is already registered in Supabase Auth.`);
          }
        } else {
          // Other auth errors (e.g. invalid password, invalid email format, rate limits)
          throw new ApiError(400, authError.message || "Failed to create user in Supabase Auth.");
        }
      }
    } catch (authErr: any) {
      if (authErr instanceof ApiError) {
        throw authErr;
      }
      console.error("Supabase Auth admin createUser error:", authErr);
      throw new ApiError(400, authErr?.message || "Failed to create user credentials in Supabase Auth.");
    }

    if (!authUserId) {
      throw new ApiError(500, "Failed to resolve user credentials in Supabase Auth.");
    }

    // 2. Insert into public.users
    const userData = {
      id: authUserId,
      name: input.name.trim(),
      role: normalizeRoleForDb(input.role),
      phone: input.phone?.trim() || null,
      avatar: input.avatar?.trim() || null,
      is_active: input.status !== "Inactive",
      created_at: new Date().toISOString(),
      created_on: new Date().toISOString().split("T")[0],
      last_modified_at: new Date().toISOString(),
      last_modified_on: new Date().toISOString().split("T")[0],
    };

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .upsert(userData, { onConflict: "id" });

    if (insertError) {
      console.error("Error inserting into public.users:", insertError);
      throw new ApiError(500, `Failed to save user in database: ${insertError.message}`);
    }

    // 3. Link user to firm in public.user_firms
    // 3. Link user to firm in public.user_firms and public.audit_team_members
    if (input.firmId) {
      const ufData = {
        firm_id: input.firmId,
        user_id: authUserId,
        create_by: creatorId || authUserId,
        created_at: new Date().toISOString(),
        created_on: new Date().toISOString().split("T")[0],
        last_modifyed_at: new Date().toISOString(),
        last_modtfy_on: new Date().toISOString().split("T")[0],
      };

      await supabaseAdmin
        .from("user_firms")
        .upsert(ufData, { onConflict: "user_id,firm_id" });

      // Always insert into public.audit_team_members (firm_id, user_id)
      const atmId = `atm_${crypto.randomUUID().replace(/-/g, "")}`;
      const atmData = {
        id: atmId,
        firm_id: input.firmId,
        user_id: authUserId,
        created_at: new Date().toISOString(),
        created_on: new Date().toISOString().split("T")[0],
      };

      const { error: atmError } = await supabaseAdmin
        .from("audit_team_members")
        .upsert(atmData, { onConflict: "firm_id,user_id" });

      if (atmError) {
        console.error("Failed to insert into audit_team_members:", atmError);
        const { data: existingAtm } = await supabaseAdmin
          .from("audit_team_members")
          .select("id")
          .eq("firm_id", input.firmId)
          .eq("user_id", authUserId)
          .maybeSingle();

        if (!existingAtm) {
          await supabaseAdmin.from("audit_team_members").insert(atmData);
        }
      }
    }

    return this.getUserById(authUserId);
  },

  /**
   * Updates user details in public.users and auth.users.
   */
  async updateUser(id: string, updates: UpdateUserInput): Promise<FormattedUserResponse> {
    const updatePayload: Record<string, any> = {
      last_modified_at: new Date().toISOString(),
      last_modified_on: new Date().toISOString().split("T")[0],
    };

    if (updates.name !== undefined) updatePayload.name = updates.name.trim();
    if (updates.role !== undefined) updatePayload.role = normalizeRoleForDb(updates.role);
    if (updates.phone !== undefined) updatePayload.phone = updates.phone?.trim() || null;
    if (updates.avatar !== undefined) updatePayload.avatar = updates.avatar?.trim() || null;
    if (updates.status !== undefined) updatePayload.is_active = updates.status !== "Inactive";

    // 1. Update public.users
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating public.users:", updateError);
      throw new ApiError(500, `Failed to update user: ${updateError.message}`);
    }

    // 2. Update Supabase Auth if password or email is changed
    if (updates.password || updates.email || updates.name || updates.role || updates.phone || updates.avatar) {
      try {
        const authUpdates: Record<string, any> = {};
        if (updates.password) authUpdates.password = updates.password;
        if (updates.email) authUpdates.email = updates.email.trim().toLowerCase();
        authUpdates.user_metadata = {
          ...(updates.name ? { name: updates.name.trim() } : {}),
          ...(updates.role ? { role: updates.role } : {}),
          ...(updates.phone ? { phone: updates.phone } : {}),
          ...(updates.avatar ? { avatar: updates.avatar } : {}),
        };

        await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      } catch (authErr) {
        console.warn("Notice updating auth.users password/metadata:", authErr);
      }
    }

    // 3. Update firm affiliation and audit_team_members if firmId provided
    if (updates.firmId) {
      await supabaseAdmin
        .from("user_firms")
        .upsert(
          {
            firm_id: updates.firmId,
            user_id: id,
            last_modifyed_at: new Date().toISOString(),
            last_modtfy_on: new Date().toISOString().split("T")[0],
          },
          { onConflict: "user_id,firm_id" }
        );

      const atmId = `atm_${crypto.randomUUID().replace(/-/g, "")}`;
      const { error: atmUpdateError } = await supabaseAdmin
        .from("audit_team_members")
        .upsert(
          {
            id: atmId,
            firm_id: updates.firmId,
            user_id: id,
            created_at: new Date().toISOString(),
            created_on: new Date().toISOString().split("T")[0],
          },
          { onConflict: "firm_id,user_id" }
        );

      if (atmUpdateError) {
        console.error("Failed to update audit_team_members:", atmUpdateError);
        const { data: existingAtm } = await supabaseAdmin
          .from("audit_team_members")
          .select("id")
          .eq("firm_id", updates.firmId)
          .eq("user_id", id)
          .maybeSingle();

        if (!existingAtm) {
          await supabaseAdmin.from("audit_team_members").insert({
            id: atmId,
            firm_id: updates.firmId,
            user_id: id,
            created_at: new Date().toISOString(),
            created_on: new Date().toISOString().split("T")[0],
          });
        }
      }
    }

    return this.getUserById(id);
  },

  /**
   * Deletes a user across tables and auth.users.
   */
  async deleteUser(id: string): Promise<void> {
    // 1. Delete from public.audit_team_members
    await supabaseAdmin.from("audit_team_members").delete().eq("user_id", id);

    // 2. Delete from public.user_firms
    await supabaseAdmin.from("user_firms").delete().eq("user_id", id);

    // 3. Delete from public.users
    const { error: deleteError } = await supabaseAdmin.from("users").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting from public.users:", deleteError);
      throw new ApiError(500, `Failed to delete user: ${deleteError.message}`);
    }

    // 4. Delete from auth.users
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (authErr) {
      console.warn("Notice deleting from auth.users:", authErr);
    }
  },
};

export default userBackendService;
