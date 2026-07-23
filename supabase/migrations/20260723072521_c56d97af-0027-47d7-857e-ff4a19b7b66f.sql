
-- Drag Racing module
CREATE TABLE IF NOT EXISTS public.drag_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  -- vehicle snapshot (kept even if vehicle deleted)
  vehicle_kind TEXT NOT NULL CHECK (vehicle_kind IN ('motorcycle','car')),
  vehicle_name TEXT,
  engine_cc INTEGER CHECK (engine_cc IS NULL OR (engine_cc > 0 AND engine_cc < 20000)),
  aspiration TEXT CHECK (aspiration IN ('na','turbo','supercharged','electric')),
  fuel_type TEXT CHECK (fuel_type IN ('gasoline','diesel','e85','electric','hybrid','other')),
  weight_class TEXT,
  weight_kg INTEGER CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg < 10000)),
  modifications TEXT,
  -- performance metrics
  zero_to_60_kmh_s NUMERIC(6,3),
  zero_to_100_kmh_s NUMERIC(6,3),
  sixty_to_120_kmh_s NUMERIC(6,3),
  eighth_mile_s NUMERIC(6,3),
  eighth_mile_trap_kmh NUMERIC(6,2),
  quarter_mile_s NUMERIC(6,3),
  quarter_mile_trap_kmh NUMERIC(6,2),
  top_speed_kmh NUMERIC(6,2),
  reaction_time_s NUMERIC(6,3),
  launch_g NUMERIC(4,2),
  -- gps + environment
  distance_m NUMERIC(8,2),
  duration_s NUMERIC(8,3),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_label TEXT,
  weather TEXT,
  temp_c NUMERIC(4,1),
  -- verification
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','flagged')),
  verification_score NUMERIC(4,2),
  anti_cheat_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('private','unlisted','public')),
  notes TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS drag_runs_user_idx ON public.drag_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS drag_runs_status_idx ON public.drag_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS drag_runs_leaderboard_idx ON public.drag_runs(vehicle_kind, status, quarter_mile_s);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drag_runs TO authenticated;
GRANT ALL ON public.drag_runs TO service_role;

ALTER TABLE public.drag_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drag_runs owner read" ON public.drag_runs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "drag_runs public read verified" ON public.drag_runs
  FOR SELECT TO authenticated USING (status = 'verified' AND visibility IN ('public','unlisted'));
CREATE POLICY "drag_runs admin read" ON public.drag_runs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "drag_runs owner insert" ON public.drag_runs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "drag_runs owner update" ON public.drag_runs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "drag_runs admin update" ON public.drag_runs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "drag_runs owner delete" ON public.drag_runs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_drag_runs_touch BEFORE UPDATE ON public.drag_runs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Raw GPS samples used for verification
CREATE TABLE IF NOT EXISTS public.drag_run_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.drag_runs(id) ON DELETE CASCADE,
  t_ms INTEGER NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed_kmh NUMERIC(6,2),
  accuracy_m NUMERIC(6,2),
  altitude_m NUMERIC(7,2),
  heading NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS drag_run_points_run_idx ON public.drag_run_points(run_id, t_ms);

GRANT SELECT, INSERT, DELETE ON public.drag_run_points TO authenticated;
GRANT ALL ON public.drag_run_points TO service_role;

ALTER TABLE public.drag_run_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drag_run_points owner read" ON public.drag_run_points
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.drag_runs r WHERE r.id = run_id AND (r.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );
CREATE POLICY "drag_run_points owner insert" ON public.drag_run_points
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.drag_runs r WHERE r.id = run_id AND r.user_id = auth.uid())
  );
CREATE POLICY "drag_run_points owner delete" ON public.drag_run_points
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.drag_runs r WHERE r.id = run_id AND r.user_id = auth.uid())
  );
