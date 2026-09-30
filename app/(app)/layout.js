import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import QueryError from "@/components/QueryError";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaults } from "@/services/settings";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let setupError = null;
  try {
    await ensureDefaults(supabase, user.id);
  } catch (error) {
    setupError = error;
  }

  return (
    <AppShell email={user.email || ""}>
      {setupError ? <QueryError error={setupError} /> : children}
    </AppShell>
  );
}
