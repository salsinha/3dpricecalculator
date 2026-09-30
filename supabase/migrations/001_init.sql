-- 3D J.A. Price Calculator
-- Execute este ficheiro uma vez no SQL Editor do Supabase.
-- Pode voltar a ser executado: as políticas e triggers são recriados.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  electricity_price numeric not null default 0.1499,
  labor_cost numeric not null default 5,
  machine_cost numeric not null default 0.40,
  default_margin numeric not null default 25,
  minimum_price numeric not null default 3.50,
  average_power numeric not null default 0.08,
  printer_name text not null default 'Bambu Lab A1 Mini',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_margin_check check (default_margin >= 0 and default_margin < 100),
  constraint settings_values_check check (
    electricity_price >= 0
    and labor_cost >= 0
    and machine_cost >= 0
    and minimum_price >= 0
    and average_power > 0
    and char_length(trim(printer_name)) > 0
  )
);

create table if not exists public.printers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  average_power numeric not null default 0.08,
  machine_cost numeric,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint printers_name_unique unique (user_id, name),
  constraint printers_values_check check (
    average_power > 0
    and (machine_cost is null or machine_cost >= 0)
    and char_length(trim(name)) > 0
  )
);

create unique index if not exists printers_one_default_per_user
  on public.printers (user_id)
  where is_default;

create table if not exists public.filaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand text not null,
  material text not null,
  color text not null,
  roll_price numeric not null,
  roll_weight numeric not null,
  price_per_kg numeric generated always as ((roll_price / roll_weight) * 1000) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint filaments_values_check check (
    roll_price >= 0
    and roll_weight > 0
    and char_length(trim(brand)) > 0
    and char_length(trim(material)) > 0
    and char_length(trim(color)) > 0
  )
);

create table if not exists public.pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  printer text not null,
  print_hours numeric not null,
  creation_hours numeric not null,
  packaging_cost numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pieces_values_check check (
    print_hours >= 0
    and creation_hours >= 0
    and packaging_cost >= 0
    and char_length(trim(name)) > 0
    and char_length(trim(printer)) > 0
  )
);

create table if not exists public.piece_plates (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references public.pieces (id) on delete cascade,
  position integer not null,
  print_hours numeric not null,
  constraint piece_plates_position_unique unique (piece_id, position),
  constraint piece_plates_hours_check check (print_hours >= 0 and position > 0)
);

create table if not exists public.piece_filaments (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references public.pieces (id) on delete cascade,
  plate_id uuid not null references public.piece_plates (id) on delete cascade,
  filament_id uuid not null references public.filaments (id) on delete restrict,
  grams numeric not null,
  constraint piece_filaments_grams_check check (grams > 0)
);

create index if not exists filaments_user_id_idx on public.filaments (user_id);
create index if not exists pieces_user_id_idx on public.pieces (user_id);
create index if not exists pieces_created_at_idx on public.pieces (created_at desc);
create index if not exists piece_plates_piece_id_idx on public.piece_plates (piece_id);
create index if not exists piece_filaments_piece_id_idx on public.piece_filaments (piece_id);
create index if not exists piece_filaments_plate_id_idx on public.piece_filaments (plate_id);
create index if not exists piece_filaments_filament_id_idx on public.piece_filaments (filament_id);
create index if not exists printers_user_id_idx on public.printers (user_id);

create table if not exists public.electricity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  price_per_kwh numeric not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint electricity_profiles_name_unique unique (user_id, name),
  constraint electricity_profiles_price_check check (
    price_per_kwh >= 0
    and char_length(trim(name)) > 0
  )
);

create unique index if not exists electricity_profiles_one_default_per_user
  on public.electricity_profiles (user_id)
  where is_default;

create index if not exists electricity_profiles_user_id_idx
  on public.electricity_profiles (user_id);

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

drop trigger if exists printers_set_updated_at on public.printers;
create trigger printers_set_updated_at
  before update on public.printers
  for each row execute function public.set_updated_at();

drop trigger if exists electricity_profiles_set_updated_at on public.electricity_profiles;
create trigger electricity_profiles_set_updated_at
  before update on public.electricity_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists filaments_set_updated_at on public.filaments;
create trigger filaments_set_updated_at
  before update on public.filaments
  for each row execute function public.set_updated_at();

drop trigger if exists pieces_set_updated_at on public.pieces;
create trigger pieces_set_updated_at
  before update on public.pieces
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.settings (user_id) values (new.id);
  insert into public.printers (user_id, name, average_power, machine_cost, is_default)
  values (new.id, 'Bambu Lab A1 Mini', 0.08, 0.40, true);
  insert into public.electricity_profiles (user_id, name, price_per_kwh, is_default)
  values (new.id, 'Casa', 0.1499, true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

alter table public.profiles enable row level security;
alter table public.electricity_profiles enable row level security;
alter table public.settings enable row level security;
alter table public.printers enable row level security;
alter table public.filaments enable row level security;
alter table public.pieces enable row level security;
alter table public.piece_plates enable row level security;
alter table public.piece_filaments enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists settings_select_own on public.settings;
create policy settings_select_own on public.settings
  for select to authenticated using (user_id = auth.uid());

drop policy if exists settings_insert_own on public.settings;
create policy settings_insert_own on public.settings
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists settings_update_own on public.settings;
create policy settings_update_own on public.settings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists settings_delete_own on public.settings;
create policy settings_delete_own on public.settings
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists printers_all_own on public.printers;
create policy printers_all_own on public.printers
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists electricity_profiles_all_own on public.electricity_profiles;
create policy electricity_profiles_all_own on public.electricity_profiles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists filaments_all_own on public.filaments;
create policy filaments_all_own on public.filaments
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists pieces_all_own on public.pieces;
create policy pieces_all_own on public.pieces
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

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

drop policy if exists piece_filaments_select_own on public.piece_filaments;
create policy piece_filaments_select_own on public.piece_filaments
  for select to authenticated
  using (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_filaments.piece_id
        and pieces.user_id = auth.uid()
    )
  );

drop policy if exists piece_filaments_insert_own on public.piece_filaments;
create policy piece_filaments_insert_own on public.piece_filaments
  for insert to authenticated
  with check (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_filaments.piece_id
        and pieces.user_id = auth.uid()
    )
    and exists (
      select 1 from public.filaments
      where filaments.id = piece_filaments.filament_id
        and filaments.user_id = auth.uid()
    )
  );

drop policy if exists piece_filaments_update_own on public.piece_filaments;
create policy piece_filaments_update_own on public.piece_filaments
  for update to authenticated
  using (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_filaments.piece_id
        and pieces.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_filaments.piece_id
        and pieces.user_id = auth.uid()
    )
    and exists (
      select 1 from public.filaments
      where filaments.id = piece_filaments.filament_id
        and filaments.user_id = auth.uid()
    )
  );

drop policy if exists piece_filaments_delete_own on public.piece_filaments;
create policy piece_filaments_delete_own on public.piece_filaments
  for delete to authenticated
  using (
    exists (
      select 1 from public.pieces
      where pieces.id = piece_filaments.piece_id
        and pieces.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
grant select, insert, update, delete on public.printers to authenticated;
grant select, insert, update, delete on public.electricity_profiles to authenticated;
grant select, insert, update, delete on public.filaments to authenticated;
grant select, insert, update, delete on public.pieces to authenticated;
grant select, insert, update, delete on public.piece_plates to authenticated;
grant select, insert, update, delete on public.piece_filaments to authenticated;

comment on table public.printers is
  'Consumo e desgaste por impressora. A impressora predefinida segue as configurações gerais.';
