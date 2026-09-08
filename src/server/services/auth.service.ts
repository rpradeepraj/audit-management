/**
 * Auth Backend Service
 * Authenticates user credentials via Supabase Auth (auth.users),
 * enriches with database profile from `public.users` & `public.firm`,
 * and issues a signed JWT token.
 */

import jwt, { SignOptions } from "jsonwebtoken";
import { supabase, supabaseAdmin, supabaseConfig } from "../config/supabase";
import { LoginInput, UserPayload } from "../schemas/auth.schema";
import { ApiError } from "../utils/apiError";
import { mapSupabaseError } from "../utils/errorHandler";

export const authBackendService = {
  /**
   * Generates a signed JWT token for an authenticated user.
   */
  generateToken(user: UserPayload): string {
    const payload = {
      ...user,
      sub: user.id,
      iss: "ams-supabase-auth",
      aud: "audit-management-system",
    };

    const signOptions: SignOptions = {
      expiresIn: (supabaseConfig.jwtExpiresIn || "7d") as any,
    };

    return jwt.sign(payload, supabaseConfig.jwtSecret, signOptions);
  },

  /**
   * Verifies and decodes a JWT token.
   */
  verifyToken(token: string): UserPayload | null {
    try {
      return jwt.verify(token, supabaseConfig.jwtSecret) as UserPayload;
    } catch {
      return null;
    }
  },

  /**
   * Authenticates user against Supabase Auth (auth.users),
   * fetches full profile from database (public.users & public.firm),
   * and returns merged user data + JWT token.
   */
  async login(input: LoginInput): Promise<{ user: UserPayload; token: string }> {
    const identifier = (input.email || input.username || "").toLowerCase().trim();
    const password = input.password;

    if (!identifier || !password) {
      throw new ApiError(400, "Email/Username and password are required.");
    }

    // 1. Authenticate via Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password,
    });

    if (authError || !authData?.user) {
      const errorDetails = mapSupabaseError(authError);
      throw new ApiError(errorDetails.statusCode, errorDetails.message);
    }

    const authUser = authData.user;

    // 2. Fetch linked profile from `public.users` and `public.firm`
    let dbUser: any = null;
    let firmData: any = null;

    try {
      const { data } = await supabaseAdmin
        .from("users")
        .select(`
          id,
          name,
          role,
          phone,
          avatar,
          firm_id,
          is_active,
          created_at,
          firm:firm_id (
            id,
            name,
            code,
            contact_email
          )
        `)
        .eq("id", authUser.id)
        .maybeSingle();

      if (data) {
        dbUser = data;
        firmData = data.firm;
      }
    } catch {
      // non-blocking fallback if public.users row is not yet created
    }


    console.log(firmData, "====")

    // 3. Merged Response: auth.users + public.users
    const user: UserPayload = {
      // Identity & Auth fields (from auth.users)
      id: authUser.id,
      email: authUser.email || identifier,
      email_confirmed_at: authUser.email_confirmed_at,
      last_sign_in_at: authUser.last_sign_in_at,


      name: dbUser?.name || authUser.user_metadata?.name,
      role: dbUser?.role || authUser.user_metadata?.role,
      phone: dbUser?.phone || authUser.phone,
      avatar: dbUser?.avatar || authUser.user_metadata?.avatar,
      firm_id: dbUser?.firm_id || authUser.user_metadata?.firm_id,
      companyName: firmData?.name || (dbUser?.firm_id ? "Veritas Assurance Partners" : undefined),
      is_active: dbUser?.is_active ?? true,
    };

    // 4. Generate JWT token on success
    const token = this.generateToken(user);
    return { user, token };
  },
};

export default authBackendService;
