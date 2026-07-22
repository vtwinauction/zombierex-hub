
CREATE TABLE public.judge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  cover_url text,
  host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','open','judging','closed','published')),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  judged_at timestamptz,
  is_public boolean NOT NULL DEFAULT true,
  vehicle_types text[] NOT NULL DEFAULT ARRAY['motorcycle','car']::text[],
  category_weights jsonb NOT NULL DEFAULT '{"exterior_finish":10,"paint_quality":10,"body_alignment":8,"engine_bay":12,"fabrication_quality":10,"wheels_tires":8,"suspension":6,"exhaust_install":6,"lighting":4,"cleanliness":6,"originality":6,"build_quality":8,"attention_detail":6}'::jsonb,
  award_categories jsonb NOT NULL DEFAULT '["best_in_show","best_custom_build","best_paint","best_engine_bay","best_fabrication","best_motorcycle","best_car","best_classic","best_restoration","zombierex_choice"]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.judge_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_events TO authenticated;
GRANT ALL ON public.judge_events TO service_role;
ALTER TABLE public.judge_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judge_events public read" ON public.judge_events FOR SELECT TO anon, authenticated
  USING (is_public = true AND status IN ('open','judging','closed','published'));
CREATE POLICY "judge_events admin all" ON public.judge_events FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE TRIGGER judge_events_touch BEFORE UPDATE ON public.judge_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX judge_events_status_idx ON public.judge_events (status);

CREATE TABLE public.judge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.judge_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'motorcycle' CHECK (vehicle_type IN ('motorcycle','car')),
  make text, model text, year int, engine_cc int, country text, city text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','processing','scored','failed','flagged')),
  overall_score numeric(5,2),
  category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  defects jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  engine_score numeric(5,2), exhaust_score numeric(5,2),
  ai_comments text,
  awards text[] NOT NULL DEFAULT ARRAY[]::text[],
  fraud_score numeric(5,2),
  submitted_at timestamptz, scored_at timestamptz, processing_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT ON public.judge_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_entries TO authenticated;
GRANT ALL ON public.judge_entries TO service_role;
ALTER TABLE public.judge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judge_entries owner read" ON public.judge_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "judge_entries public read of published" ON public.judge_entries FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.judge_events e WHERE e.id = event_id AND e.status = 'published' AND e.is_public = true));
CREATE POLICY "judge_entries owner insert" ON public.judge_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "judge_entries owner update draft" ON public.judge_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('draft','submitted'))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "judge_entries owner delete draft" ON public.judge_entries FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'draft');
CREATE POLICY "judge_entries admin all" ON public.judge_entries FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE TRIGGER judge_entries_touch BEFORE UPDATE ON public.judge_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX judge_entries_event_idx ON public.judge_entries (event_id, status);
CREATE INDEX judge_entries_user_idx ON public.judge_entries (user_id);
CREATE INDEX judge_entries_score_idx ON public.judge_entries (event_id, overall_score DESC);

CREATE TABLE public.judge_entry_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.judge_entries(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('exterior_360','engine_bay','suspension','wheels','exhaust','interior','walkaround_video','startup_video','exhaust_audio')),
  storage_path text NOT NULL,
  mime text, sha256 text, width int, height int, duration_ms int,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.judge_entry_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_entry_media TO authenticated;
GRANT ALL ON public.judge_entry_media TO service_role;
ALTER TABLE public.judge_entry_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judge_media owner read" ON public.judge_entry_media FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.judge_entries e WHERE e.id = entry_id AND e.user_id = auth.uid()));
CREATE POLICY "judge_media public read of published" ON public.judge_entry_media FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.judge_entries e JOIN public.judge_events ev ON ev.id = e.event_id
                 WHERE e.id = entry_id AND ev.status = 'published' AND ev.is_public = true));
CREATE POLICY "judge_media owner insert" ON public.judge_entry_media FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.judge_entries e WHERE e.id = entry_id AND e.user_id = auth.uid() AND e.status IN ('draft','submitted')));
CREATE POLICY "judge_media owner delete" ON public.judge_entry_media FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.judge_entries e WHERE e.id = entry_id AND e.user_id = auth.uid() AND e.status = 'draft'));
CREATE POLICY "judge_media admin all" ON public.judge_entry_media FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE INDEX judge_media_entry_idx ON public.judge_entry_media (entry_id, kind, order_index);
CREATE INDEX judge_media_sha_idx ON public.judge_entry_media (sha256) WHERE sha256 IS NOT NULL;

CREATE TABLE public.judge_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.judge_entries(id) ON DELETE CASCADE,
  reason text NOT NULL, detail text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_flags TO authenticated;
GRANT ALL ON public.judge_flags TO service_role;
ALTER TABLE public.judge_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judge_flags admin all" ON public.judge_flags FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE INDEX judge_flags_open_idx ON public.judge_flags (resolved, created_at DESC);

CREATE TABLE public.judge_leaderboard_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.judge_events(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('event','country','city','vehicle_type','brand','model','engine_size','global')),
  scope_key text,
  entry_id uuid NOT NULL REFERENCES public.judge_entries(id) ON DELETE CASCADE,
  rank int NOT NULL,
  score numeric(5,2) NOT NULL,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.judge_leaderboard_cache TO anon, authenticated;
GRANT ALL ON public.judge_leaderboard_cache TO service_role;
ALTER TABLE public.judge_leaderboard_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judge_leaderboard public read" ON public.judge_leaderboard_cache FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "judge_leaderboard admin write" ON public.judge_leaderboard_cache FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE INDEX judge_leaderboard_lookup_idx ON public.judge_leaderboard_cache (scope, scope_key, event_id, rank);

INSERT INTO public.feature_flags (key, enabled, description)
SELECT 'judge.enabled', false, 'ZombieRex AI Show Judge module'
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE key = 'judge.enabled');

CREATE POLICY "judge storage owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'judge' AND owner = auth.uid());
CREATE POLICY "judge storage owner write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'judge' AND owner = auth.uid());
CREATE POLICY "judge storage owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'judge' AND owner = auth.uid());
CREATE POLICY "judge storage admin all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'judge'
         AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'judge'
              AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
