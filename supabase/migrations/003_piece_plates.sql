-- Várias plates por peça.
-- O mesmo filamento pode ser usado em plates diferentes.
-- Execute este ficheiro no SQL Editor do Supabase.

create table if not exists public.piece_plates (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references public.pieces (id) on delete cascade,
  position integer not null,
  print_hours numeric not null,
  constraint piece_plates_position_unique unique (piece_id, position),
  constraint piece_plates_hours_check check (print_hours >= 0 and position > 0)
);

create index if not exists piece_plates_piece_id_idx on public.piece_plates (piece_id);

insert into public.piece_plates (piece_id, position, print_hours)
select id, 1, print_hours
from public.pieces
where not exists (
  select 1 from public.piece_plates where piece_plates.piece_id = pieces.id
);

alter table public.piece_filaments
  add column if not exists plate_id uuid references public.piece_plates (id) on delete cascade;

update public.piece_filaments
set plate_id = piece_plates.id
from public.piece_plates
where piece_plates.piece_id = piece_filaments.piece_id
  and piece_plates.position = 1
  and piece_filaments.plate_id is null;

alter table public.piece_filaments
  alter column plate_id set not null;

alter table public.piece_filaments
  drop constraint if exists piece_filaments_unique;

create index if not exists piece_filaments_plate_id_idx on public.piece_filaments (plate_id);

alter table public.piece_plates enable row level security;

drop policy if exists piece_plates_select_own on public.piece_plates;
create policy piece_plates_select_own on public.piece_plates
  for select to authenticated
  using (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_plates.piece_id
        and pieces.user_id = auth.uid()
    )
  );

drop policy if exists piece_plates_insert_own on public.piece_plates;
create policy piece_plates_insert_own on public.piece_plates
  for insert to authenticated
  with check (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_plates.piece_id
        and pieces.user_id = auth.uid()
    )
  );

drop policy if exists piece_plates_update_own on public.piece_plates;
create policy piece_plates_update_own on public.piece_plates
  for update to authenticated
  using (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_plates.piece_id
        and pieces.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_plates.piece_id
        and pieces.user_id = auth.uid()
    )
  );

drop policy if exists piece_plates_delete_own on public.piece_plates;
create policy piece_plates_delete_own on public.piece_plates
  for delete to authenticated
  using (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_plates.piece_id
        and pieces.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.piece_plates to authenticated;

drop function if exists public.save_piece(uuid, text, text, numeric, numeric, numeric, jsonb);

create or replace function public.save_piece(
  p_id uuid,
  p_name text,
  p_printer text,
  p_creation_hours numeric,
  p_packaging_cost numeric,
  p_plates jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  plate jsonb;
  item jsonb;
  v_plate_id uuid;
  v_position integer := 0;
  v_hours numeric;
  v_total_hours numeric := 0;
  v_filament uuid;
  v_grams numeric;
  v_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Sessão expirada. Entre novamente.';
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Indique o nome da peça.';
  end if;

  if p_printer is null or char_length(trim(p_printer)) = 0 then
    raise exception 'Indique a impressora.';
  end if;

  if p_creation_hours < 0 or p_packaging_cost < 0 then
    raise exception 'Valores numéricos inválidos.';
  end if;

  if p_plates is null or jsonb_typeof(p_plates) <> 'array' or jsonb_array_length(p_plates) < 1 then
    raise exception 'Adicione pelo menos uma plate.';
  end if;

  if p_id is null then
    insert into public.pieces (user_id, name, printer, print_hours, creation_hours, packaging_cost)
    values (auth.uid(), trim(p_name), trim(p_printer), 0, p_creation_hours, p_packaging_cost)
    returning id into v_id;
  else
    update public.pieces
      set name = trim(p_name),
          printer = trim(p_printer),
          creation_hours = p_creation_hours,
          packaging_cost = p_packaging_cost
      where id = p_id
        and user_id = auth.uid()
      returning id into v_id;

    if v_id is null then
      raise exception 'Peça não encontrada.';
    end if;

    delete from public.piece_filaments where piece_id = v_id;
    delete from public.piece_plates where piece_id = v_id;
  end if;

  for plate in select * from jsonb_array_elements(p_plates)
  loop
    v_position := v_position + 1;
    v_hours := (plate->>'print_hours')::numeric;

    if v_hours is null or v_hours < 0 then
      raise exception 'Indique um tempo de impressão válido.';
    end if;

    if plate->'filaments' is null
      or jsonb_typeof(plate->'filaments') <> 'array'
      or jsonb_array_length(plate->'filaments') < 1 then
      raise exception 'Cada plate precisa de pelo menos um filamento.';
    end if;

    v_total_hours := v_total_hours + v_hours;

    insert into public.piece_plates (piece_id, position, print_hours)
    values (v_id, v_position, v_hours)
    returning id into v_plate_id;

    for item in select * from jsonb_array_elements(plate->'filaments')
    loop
      v_filament := (item->>'filament_id')::uuid;
      v_grams := (item->>'grams')::numeric;
      v_count := v_count + 1;

      if v_grams is null or v_grams <= 0 then
        raise exception 'A quantidade tem de ser superior a zero.';
      end if;

      if not exists (
        select 1 from public.filaments
        where id = v_filament and user_id = auth.uid()
      ) then
        raise exception 'Filamento inválido.';
      end if;

      insert into public.piece_filaments (piece_id, plate_id, filament_id, grams)
      values (v_id, v_plate_id, v_filament, v_grams);
    end loop;
  end loop;

  if v_count < 1 then
    raise exception 'Adicione pelo menos um filamento.';
  end if;

  update public.pieces
    set print_hours = v_total_hours
    where id = v_id;

  return v_id;
end;
$$;

revoke all on function public.save_piece(uuid, text, text, numeric, numeric, jsonb) from public;
grant execute on function public.save_piece(uuid, text, text, numeric, numeric, jsonb) to authenticated;
