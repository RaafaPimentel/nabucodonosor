import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/db/schema";
import { env } from "@/lib/env";

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service-role configuration.");
  }

  if (!client) {
    client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
  }

  return client;
}
