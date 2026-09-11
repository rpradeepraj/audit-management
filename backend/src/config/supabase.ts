import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Server-side Supabase Configuration
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-anon-key",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  jwtSecret: process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || "ams-audit-management-jwt-secret-key-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

/**
 * Standard Supabase Server Client (using anon key)
 * Used for standard Supabase Auth operations: supabase.auth.signInWithPassword, etc.
 */
export const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Privileged Admin Supabase Server Client (using service role key)
 * Used for database table queries bypassing RLS.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey || supabaseConfig.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export default supabase;
