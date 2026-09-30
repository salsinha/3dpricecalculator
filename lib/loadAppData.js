import { createClient } from "@/lib/supabase/server";
import { listFilaments } from "@/services/filaments";
import { listPieces } from "@/services/pieces";
import { getSettings, listElectricityProfiles, listPrinters, activeElectricityProfile } from "@/services/settings";

export async function loadAppData() {
  const supabase = await createClient();
  const [pieces, filaments, settings, printers, electricityProfiles] = await Promise.all([
    listPieces(supabase),
    listFilaments(supabase),
    getSettings(supabase),
    listPrinters(supabase),
    listElectricityProfiles(supabase),
  ]);

  const activeProfile = activeElectricityProfile(electricityProfiles);
  const pricedSettings = activeProfile
    ? {
        ...settings,
        electricityPrice: activeProfile.pricePerKwh,
        electricityProfileId: activeProfile.id,
        electricityProfileName: activeProfile.name,
      }
    : settings;

  return { pieces, filaments, settings: pricedSettings, printers, electricityProfiles };
}

export async function loadAppDataSafely() {
  try {
    return { data: await loadAppData(), error: null };
  } catch (error) {
    return { data: null, error };
  }
}
