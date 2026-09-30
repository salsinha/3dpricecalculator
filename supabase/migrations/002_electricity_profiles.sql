-- Perfis de preço da eletricidade.
-- Execute este ficheiro no SQL Editor do Supabase, depois de 001_init.sql.

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

drop trigger if exists electricity_profiles_set_updated_at on public.electricity_profiles;
create trigger electricity_profiles_set_updated_at
  before update on public.electricity_profiles
  for each row execute function public.set_updated_at();

insert into public.electricity_profiles (user_id, name, price_per_kwh, is_default)
select user_id, 'Casa', electricity_price, true
from public.settings
where not exists (
  select 1
  from public.electricity_profiles
  where electricity_profiles.user_id = settings.user_id
);

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

alter table public.electricity_profiles enable row level security;

drop policy if exists electricity_profiles_all_own on public.electricity_profiles;
create policy electricity_profiles_all_own on public.electricity_profiles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.electricity_profiles to authenticated;

comment on table public.electricity_profiles is
  'Preço da eletricidade por casa. O perfil predefinido entra nos cálculos.';
