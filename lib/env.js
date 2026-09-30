export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  return {
    url,
    key,
    configured: url.startsWith("https://") && key.length > 20,
  };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured;
}
