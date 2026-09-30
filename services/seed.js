import { EXAMPLE_FILAMENTS, EXAMPLE_PIECE } from "@/lib/constants";
import { createFilament, listFilaments } from "@/services/filaments";
import { listPieces, savePiece } from "@/services/pieces";

function filamentKey(filament) {
  return `${filament.brand}|${filament.material}|${filament.color}`.toLowerCase();
}

export async function loadExampleData(supabase) {
  const filaments = await listFilaments(supabase);
  const byKey = new Map(filaments.map((filament) => [filamentKey(filament), filament]));
  let added = false;

  for (const example of EXAMPLE_FILAMENTS) {
    if (byKey.has(filamentKey(example))) continue;
    const created = await createFilament(supabase, example);
    byKey.set(filamentKey(created), created);
    added = true;
  }

  const pieces = await listPieces(supabase);
  const exists = pieces.some((piece) => piece.name === EXAMPLE_PIECE.name);

  if (!exists) {
    const lines = EXAMPLE_PIECE.filaments.map((line) => {
      const filament = byKey.get(`bambu lab|pla|${line.color.toLowerCase()}`);
      if (!filament) {
        throw new Error("Não foi possível associar os filamentos de exemplo.");
      }
      return { filamentId: filament.id, grams: line.grams };
    });

    await savePiece(supabase, {
      name: EXAMPLE_PIECE.name,
      printer: EXAMPLE_PIECE.printer,
      creationHours: EXAMPLE_PIECE.creationHours,
      packagingCost: EXAMPLE_PIECE.packagingCost,
      plates: [
        {
          printHours: EXAMPLE_PIECE.printHours,
          filaments: lines,
        },
      ],
    });
    added = true;
  }

  return { added };
}
