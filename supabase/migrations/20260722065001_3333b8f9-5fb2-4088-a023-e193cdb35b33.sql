
CREATE TABLE IF NOT EXISTS public.community_pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  kind text NOT NULL DEFAULT 'custom' CHECK (kind IN ('hotel','food','fuel','scenic','repair','viewpoint','hazard','meetup','custom')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  address text,
  note text CHECK (note IS NULL OR char_length(note) <= 600),
  region text,
  upvotes_count integer NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_pois_geo_idx ON public.community_pois (lat, lng);
CREATE INDEX IF NOT EXISTS community_pois_kind_idx ON public.community_pois (kind);

GRANT SELECT ON public.community_pois TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_pois TO authenticated;
GRANT ALL ON public.community_pois TO service_role;

ALTER TABLE public.community_pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_pois public read"
  ON public.community_pois FOR SELECT
  USING (is_hidden = false);
CREATE POLICY "community_pois owner read hidden"
  ON public.community_pois FOR SELECT
  TO authenticated USING (created_by = auth.uid());
CREATE POLICY "community_pois insert self"
  ON public.community_pois FOR INSERT
  TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "community_pois owner update"
  ON public.community_pois FOR UPDATE
  TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "community_pois owner delete"
  ON public.community_pois FOR DELETE
  TO authenticated USING (created_by = auth.uid());
CREATE POLICY "community_pois admin manage"
  ON public.community_pois FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
