-- Agenda do dentista: horários marcados, com ou sem paciente cadastrado.
-- Cada horário pode ter sido enviado ao Google Agenda (google_event_id guarda o vínculo).
-- RLS: cada dentista só enxerga e altera a própria agenda.

begin;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patient_id uuid references public.patients (id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  starts_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 720),
  notes text not null default '' check (char_length(notes) <= 2000),
  google_event_id text check (google_event_id is null or char_length(google_event_id) <= 1024),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_owner_starts_idx on public.appointments (owner_id, starts_at);
create index if not exists appointments_patient_idx on public.appointments (patient_id);

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function private.set_updated_at();

revoke all on public.appointments from public, anon;
grant select, insert, update, delete on public.appointments to authenticated;

alter table public.appointments enable row level security;

create policy "appointments_select_own" on public.appointments
  for select to authenticated
  using (owner_id = (select auth.uid()));

-- Paciente vinculado precisa ser do mesmo dentista.
create policy "appointments_insert_own" on public.appointments
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (patient_id is null or exists (
      select 1 from public.patients p where p.id = patient_id and p.owner_id = (select auth.uid())
    ))
  );

create policy "appointments_update_own" on public.appointments
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and (patient_id is null or exists (
      select 1 from public.patients p where p.id = patient_id and p.owner_id = (select auth.uid())
    ))
  );

create policy "appointments_delete_own" on public.appointments
  for delete to authenticated
  using (owner_id = (select auth.uid()));

commit;
