import { createClient } from "@/lib/supabase/server";
import { listFilaments } from "@/services/filaments";
import { listPieces } from "@/services/pieces";
import { getSettings, listPrinters } from "@/services/settings";

export async function loadAppData() {
  const supabase = await createClient();
  const [pieces, filaments, settings, printers] = await Promise.all([
    listPieces(supabase),
    listFilaments(supabase),
    getSettings(supabase),
    listPrinters(supabase),
  ]);

  return { pieces, filaments, settings, printers };
}

export async function loadAppDataSafely() {
  try {
    return { data: await loadAppData(), error: null };
  } catch (error) {
    return { data: null, error };
  }
}
