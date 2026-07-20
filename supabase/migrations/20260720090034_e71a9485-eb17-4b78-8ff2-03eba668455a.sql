
CREATE TYPE public.route_visibility AS ENUM ('public','private');
CREATE TYPE public.route_poi_kind AS ENUM ('hotel','food','fuel','scenic','repair','viewpoint','custom');
CREATE TYPE public.route_difficulty AS ENUM ('easy','moderate','hard','expert');
CREATE TYPE public.route_surface AS ENUM ('paved','mixed','offroad');

-- routes
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  visibility public.route_visibility NOT NULL DEFAULT 'public',
  distance_m integer NOT NULL DEFAULT 0,
  duration_s integer NOT NULL DEFAULT 0,
  difficulty public.route_difficulty NOT NULL DEFAULT 'moderate',
  surface public.route_surface NOT NULL DEFAULT 'paved',
  region text,
  cover_url text,
  path jsonb NOT NULL DEFAULT '[]'::jsonb,
  start_lat double precision,
  start_lng double precision,
  end_lat double precision,
  end_lng double precision,
  saves_count integer NOT NULL DEFAULT 0,
  rides_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routes TO authenticated;
GRANT SELECT ON public.routes TO anon;
GRANT ALL ON public.routes TO service_role;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public routes readable" ON public.routes FOR SELECT USING (visibility='public' OR auth.uid() = owner_id);
CREATE POLICY "owner insert routes" ON public.routes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner update routes" ON public.routes FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner delete routes" ON public.routes FOR DELETE USING (auth.uid() = owner_id);
CREATE INDEX routes_owner_idx ON public.routes(owner_id);
CREATE INDEX routes_public_created_idx ON public.routes(created_at DESC) WHERE visibility='public';

-- route_pois
CREATE TABLE public.route_pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind public.route_poi_kind NOT NULL DEFAULT 'custom',
  google_place_id text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  address text,
  note text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_pois TO authenticated;
GRANT SELECT ON public.route_pois TO anon;
GRANT ALL ON public.route_pois TO service_role;
ALTER TABLE public.route_pois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poi readable via route" ON public.route_pois FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.routes r WHERE r.id = route_id AND (r.visibility='public' OR r.owner_id = auth.uid()))
);
CREATE POLICY "poi owner write" ON public.route_pois FOR ALL USING (
  EXISTS (SELECT 1 FROM public.routes r WHERE r.id = route_id AND r.owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.routes r WHERE r.id = route_id AND r.owner_id = auth.uid())
);
CREATE INDEX route_pois_route_idx ON public.route_pois(route_id, order_index);

-- route_saves
CREATE TABLE public.route_saves (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);
GRANT SELECT, INSERT, DELETE ON public.route_saves TO authenticated;
GRANT ALL ON public.route_saves TO service_role;
ALTER TABLE public.route_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saves read" ON public.route_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own saves write" ON public.route_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saves delete" ON public.route_saves FOR DELETE USING (auth.uid() = user_id);

-- route_rides
CREATE TABLE public.route_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.route_rides TO authenticated;
GRANT ALL ON public.route_rides TO service_role;
ALTER TABLE public.route_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rides read" ON public.route_rides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own rides insert" ON public.route_rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX route_rides_route_idx ON public.route_rides(route_id);

-- route_comments
CREATE TABLE public.route_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.route_comments TO authenticated;
GRANT SELECT ON public.route_comments TO anon;
GRANT ALL ON public.route_comments TO service_role;
ALTER TABLE public.route_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments readable via route" ON public.route_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.routes r WHERE r.id = route_id AND (r.visibility='public' OR r.owner_id = auth.uid()))
);
CREATE POLICY "comments own insert" ON public.route_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments own delete" ON public.route_comments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX route_comments_route_idx ON public.route_comments(route_id, created_at DESC);

-- counter triggers
CREATE OR REPLACE FUNCTION public.bump_route_saves() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP='INSERT' THEN UPDATE public.routes SET saves_count = saves_count + 1 WHERE id = NEW.route_id; RETURN NEW;
  ELSIF TG_OP='DELETE' THEN UPDATE public.routes SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.route_id; RETURN OLD;
  END IF; RETURN NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.bump_route_saves() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_bump_route_saves AFTER INSERT OR DELETE ON public.route_saves FOR EACH ROW EXECUTE FUNCTION public.bump_route_saves();

CREATE OR REPLACE FUNCTION public.bump_route_rides() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.routes SET rides_count = rides_count + 1 WHERE id = NEW.route_id;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.bump_route_rides() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_bump_route_rides AFTER INSERT ON public.route_rides FOR EACH ROW EXECUTE FUNCTION public.bump_route_rides();

CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
