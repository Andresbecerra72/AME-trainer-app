'use server';
// /lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client that bypasses Row Level Security (RLS).
 * 
 * ⚠️ SECURITY WARNING:
 * This client has unrestricted database access and bypasses all RLS policies.
 * Only use this for legitimate admin operations after proper authorization checks.
 * 
 * Usage pattern:
 * 1. Verify user has admin/super_admin role
 * 2. Use this client for the specific admin operation
 * 3. Never expose this to client-side code
 */
export async function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
