import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { url, key, configured } = getSupabaseEnv();
  if (!configured) {
    throw new Error("Supabase não está configurado.");
  }
  return createBrowserClient(url, key);
}
