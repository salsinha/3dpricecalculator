import { DEFAULTS } from "@/lib/constants";
import { mapPrinter, mapSettings } from "@/services/mappers";

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
      electricity_price: values.electricityPrice,
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
