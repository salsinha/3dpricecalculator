import { mapFilament } from "@/services/mappers";

const FILAMENT_COLUMNS =
  "id, brand, material, color, roll_price, roll_weight, price_per_kg, created_at, updated_at";

export async function listFilaments(supabase) {
  const { data, error } = await supabase
    .from("filaments")
    .select(FILAMENT_COLUMNS)
    .order("brand", { ascending: true })
    .order("material", { ascending: true })
    .order("color", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapFilament);
}

export async function createFilament(supabase, values) {
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("filaments")
    .insert({
      user_id: userId,
      brand: values.brand,
      material: values.material,
      color: values.color,
      roll_price: values.rollPrice,
      roll_weight: values.rollWeight,
    })
    .select(FILAMENT_COLUMNS)
    .single();

  if (error) throw error;
  return mapFilament(data);
}

export async function updateFilament(supabase, id, values) {
  const { data, error } = await supabase
    .from("filaments")
    .update({
      brand: values.brand,
      material: values.material,
      color: values.color,
      roll_price: values.rollPrice,
      roll_weight: values.rollWeight,
    })
    .eq("id", id)
    .select(FILAMENT_COLUMNS)
    .single();

  if (error) throw error;
  return mapFilament(data);
}

export async function deleteFilament(supabase, id) {
  const { error } = await supabase.from("filaments").delete().eq("id", id);
  if (error) throw error;
}

async function requireUserId(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}
