-- =============================================================================
-- Odontra: schema inicial do prontuário
--
-- O quê:   profiles (dentista), patients (ficha) e visits (consultas/histórico).
-- Por quê: tirar os dados do localStorage e guardar no Supabase com login.
--
-- Segurança (dados de saúde = PII restrita, LGPD):
--   * Um tipo de usuário: o dentista. Cada um só enxerga o que é dele (owner_id).
--   * RLS habilitada em todas as tabelas, uma policy por operação, TO authenticated,
--     usando (select auth.uid()) e IS NOT NULL explícito.
--   * anon não tem nenhum privilégio nas tabelas.
--   * Funções internas no schema private, search_path fixo e EXECUTE revogado
--     de PUBLIC, anon e authenticated.
--   * Uma consulta só pode apontar para um paciente do mesmo dono.
-- =============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Funções de apoio
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.set_updated_at() FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------------------------------
-- profiles: o dentista (único tipo de usuário por enquanto)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name   text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 160),
  cro         text NOT NULL DEFAULT '' CHECK (char_length(cro) <= 40),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfil do dentista (1:1 com auth.users). Classificação: confidencial.';

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- Cria o perfil automaticamente no cadastro.
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data ->> 'full_name', ''), 160))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- -----------------------------------------------------------------------------
-- patients: ficha do paciente
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  record_number   integer NOT NULL CHECK (record_number > 0),
  -- Foto reduzida no cliente (JPEG ~480px) em data URL. Limite evita abuso de armazenamento.
  photo           text NOT NULL DEFAULT '' CHECK (char_length(photo) <= 600000),
  identification  jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(identification) = 'object'),
  anamnesis       jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(anamnesis) = 'object'),
  full_name       text GENERATED ALWAYS AS (coalesce(identification ->> 'name', '')) STORED,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patients_owner_record_number_key UNIQUE (owner_id, record_number)
);

COMMENT ON TABLE public.patients IS 'Ficha do paciente. Contém CPF, RG, foto e dados de saúde: classificação restrita.';

CREATE INDEX IF NOT EXISTS patients_owner_id_idx ON public.patients (owner_id);
CREATE INDEX IF NOT EXISTS patients_owner_full_name_idx ON public.patients (owner_id, full_name);

CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- -----------------------------------------------------------------------------
-- visits: consultas (histórico do paciente)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.visits (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  patient_id     uuid NOT NULL REFERENCES public.patients (id) ON DELETE CASCADE,
  sequence       integer NOT NULL CHECK (sequence > 0),
  visit_date     date NOT NULL DEFAULT current_date,
  dentist        jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(dentist) = 'object'),
  reason         text NOT NULL DEFAULT '' CHECK (char_length(reason) <= 500),
  oral_health    jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(oral_health) = 'object'),
  clinical_exam  jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(clinical_exam) = 'object'),
  odontogram     jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(odontogram) = 'object'),
  findings       text NOT NULL DEFAULT '' CHECK (char_length(findings) <= 20000),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visits_patient_sequence_key UNIQUE (patient_id, sequence)
);

COMMENT ON TABLE public.visits IS 'Consulta/evolução clínica. Dados de saúde: classificação restrita.';

CREATE INDEX IF NOT EXISTS visits_owner_id_idx ON public.visits (owner_id);
CREATE INDEX IF NOT EXISTS visits_patient_id_idx ON public.visits (patient_id);

CREATE TRIGGER visits_set_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Privilégios: anon não toca em nada; authenticated só via RLS
-- -----------------------------------------------------------------------------

REVOKE ALL ON public.profiles, public.patients, public.visits FROM PUBLIC, anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients, public.visits TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits   ENABLE ROW LEVEL SECURITY;

-- profiles: cada dentista lê e edita só o próprio perfil (criação é pelo trigger).
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- patients
CREATE POLICY patients_select_own ON public.patients
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id);

CREATE POLICY patients_insert_own ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id);

CREATE POLICY patients_update_own ON public.patients
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY patients_delete_own ON public.patients
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id);

-- visits: além de ser dono da consulta, o paciente referenciado precisa ser dele.
CREATE POLICY visits_select_own ON public.visits
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id);

CREATE POLICY visits_insert_own ON public.visits
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()) = owner_id
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY visits_update_own ON public.visits
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id)
  WITH CHECK (
    (SELECT auth.uid()) = owner_id
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY visits_delete_own ON public.visits
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = owner_id);

COMMIT;
