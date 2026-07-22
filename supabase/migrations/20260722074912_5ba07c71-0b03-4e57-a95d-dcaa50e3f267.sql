
-- Rides: private telemetry (distinct from published public routes)
CREATE TABLE public.rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  notes text,
  path jsonb NOT NULL DEFAULT '[]'::jsonb,           -- [{lat,lng,t,spd,alt}]
  distance_m integer NOT NULL DEFAULT 0,
  duration_s integer NOT NULL DEFAULT 0,
  moving_s integer NOT NULL DEFAULT 0,
  avg_speed_kmh numeric(6,2) NOT NULL DEFAULT 0,
  max_speed_kmh numeric(6,2) NOT NULL DEFAULT 0,
  elev_gain_m integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  visibility text NOT NULL DEFAULT 'private',        -- private | unlisted | public
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rides TO authenticated;
GRANT ALL ON public.rides TO service_role;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rides select" ON public.rides FOR SELECT TO authenticated USING (auth.uid() = user_id OR visibility IN ('unlisted','public'));
CREATE POLICY "own rides insert" ON public.rides FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rides update" ON public.rides FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rides delete" ON public.rides FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX rides_user_started_idx ON public.rides(user_id, started_at DESC);
CREATE TRIGGER rides_set_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Emergency contacts (used by SOS in step 4; created now to avoid a second migration turn)
CREATE TABLE public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  relation text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts all" ON public.emergency_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
