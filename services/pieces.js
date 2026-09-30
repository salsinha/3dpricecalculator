import { mapPiece } from "@/services/mappers";

const PIECE_SELECT = `
  id, name, printer, print_hours, creation_hours, packaging_cost, created_at, updated_at,
  piece_filaments (
    id, grams, filament_id,
    filaments ( id, brand, material, color, roll_price, roll_weight, price_per_kg )
  )
`;

export async function listPieces(supabase) {
  const { data, error } = await supabase
    .from("pieces")
    .select(PIECE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPiece);
}

export async function savePiece(supabase, values) {
  const { data, error } = await supabase.rpc("save_piece", {
    p_id: values.id || null,
    p_name: values.name,
    p_printer: values.printer,
    p_print_hours: values.printHours,
    p_creation_hours: values.creationHours,
    p_packaging_cost: values.packagingCost,
    p_filaments: values.filaments.map((line) => ({
      filament_id: line.filamentId,
      grams: line.grams,
    })),
  });

  if (error) throw error;
  return data;
}

export async function deletePiece(supabase, id) {
  const { error } = await supabase.from("pieces").delete().eq("id", id);
  if (error) throw error;
}
