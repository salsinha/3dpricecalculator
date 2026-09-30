import { DEFAULTS } from "@/lib/constants";
import { mapElectricityProfile, mapPrinter, mapSettings } from "@/services/mappers";

async function requireUserId(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export async function ensureDefaults(supabase, userId) {
  const { error: profileError } = await supabase.from("profiles").insert({ id: userId });
  if (profileError && profileError.code !== "23505") throw profileError;

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (settingsError) throw settingsError;

  if (!settings) {
    const { error } = await supabase.from("settings").insert({ user_id: userId });
    if (error && error.code !== "23505") throw error;
  }

  const { data: printers, error: printersError } = await supabase
    .from("printers")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (printersError) throw printersError;

  if (!printers?.length) {
    const { error } = await supabase.from("printers").insert({
      user_id: userId,
      name: DEFAULTS.printerName,
      average_power: DEFAULTS.averagePower,
      machine_cost: DEFAULTS.machineCost,
      is_default: true,
    });
    if (error && error.code !== "23505") throw error;
  }

  const { data: electricityProfiles, error: electricityError } = await supabase
    .from("electricity_profiles")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (electricityError) throw electricityError;

  if (!electricityProfiles?.length) {
    const { data: currentSettings } = await supabase
      .from("settings")
      .select("electricity_price")
      .eq("user_id", userId)
      .maybeSingle();

    const { error } = await supabase.from("electricity_profiles").insert({
      user_id: userId,
      name: "Casa",
      price_per_kwh: currentSettings?.electricity_price ?? DEFAULTS.electricityPrice,
      is_default: true,
    });
    if (error && error.code !== "23505") throw error;
  }
}

export async function getSettings(supabase) {
  const { data, error } = await supabase.from("settings").select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("As configurações ainda não existem nesta conta.");
  return mapSettings(data);
}

export async function saveSettings(supabase, values) {
  const userId = await requireUserId(supabase);

  const { error: printerError } = await supabase
    .from("printers")
    .update({
      name: values.printerName,
      average_power: values.averagePower,
      machine_cost: values.machineCost,
    })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (printerError) throw printerError;

  const { data, error } = await supabase
    .from("settings")
    .update({
      labor_cost: values.laborCost,
      machine_cost: values.machineCost,
      default_margin: values.defaultMargin,
      minimum_price: values.minimumPrice,
      average_power: values.averagePower,
      printer_name: values.printerName,
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapSettings(data);
}

export async function listPrinters(supabase) {
  const { data, error } = await supabase
    .from("printers")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapPrinter);
}

export async function createPrinter(supabase, values) {
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("printers")
    .insert({
      user_id: userId,
      name: values.name,
      average_power: values.averagePower,
      machine_cost: values.machineCost,
      is_default: false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPrinter(data);
}

export async function deletePrinter(supabase, printer) {
  if (printer.isDefault) {
    throw new Error("A impressora predefinida elimina-se apenas ao mudar o nome nas configurações.");
  }
  const { error } = await supabase.from("printers").delete().eq("id", printer.id);
  if (error) throw error;
}

export async function listElectricityProfiles(supabase) {
  const { data, error } = await supabase
    .from("electricity_profiles")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapElectricityProfile);
}

export function activeElectricityProfile(profiles) {
  return profiles.find((profile) => profile.isDefault) || profiles[0] || null;
}

async function syncElectricityPrice(supabase, userId, pricePerKwh) {
  const { error } = await supabase
    .from("settings")
    .update({ electricity_price: pricePerKwh })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function createElectricityProfile(supabase, values) {
  const userId = await requireUserId(supabase);
  const existing = await listElectricityProfiles(supabase);
  const isDefault = existing.length === 0;

  const { data, error } = await supabase
    .from("electricity_profiles")
    .insert({
      user_id: userId,
      name: values.name,
      price_per_kwh: values.pricePerKwh,
      is_default: isDefault,
    })
    .select("*")
    .single();

  if (error) throw error;
  if (isDefault) await syncElectricityPrice(supabase, userId, values.pricePerKwh);
  return mapElectricityProfile(data);
}

export async function updateElectricityProfile(supabase, id, values) {
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("electricity_profiles")
    .update({
      name: values.name,
      price_per_kwh: values.pricePerKwh,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  const profile = mapElectricityProfile(data);
  if (profile.isDefault) await syncElectricityPrice(supabase, userId, profile.pricePerKwh);
  return profile;
}

export async function setActiveElectricityProfile(supabase, id) {
  const userId = await requireUserId(supabase);

  const { error: clearError } = await supabase
    .from("electricity_profiles")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (clearError) throw clearError;

  const { data, error } = await supabase
    .from("electricity_profiles")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  const profile = mapElectricityProfile(data);
  await syncElectricityPrice(supabase, userId, profile.pricePerKwh);
  return profile;
}

export async function deleteElectricityProfile(supabase, profile) {
  const userId = await requireUserId(supabase);
  const existing = await listElectricityProfiles(supabase);
  if (existing.length <= 1) {
    throw new Error("Tem de existir pelo menos um perfil de eletricidade.");
  }

  const { error } = await supabase
    .from("electricity_profiles")
    .delete()
    .eq("id", profile.id)
    .eq("user_id", userId);

  if (error) throw error;

  if (profile.isDefault) {
    const replacement = existing.find((item) => item.id !== profile.id);
    if (replacement) await setActiveElectricityProfile(supabase, replacement.id);
  }
}
