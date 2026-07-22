
CREATE TABLE public.group_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Group Ride',
  join_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended')),
  meet_lat DOUBLE PRECISION,
  meet_lng DOUBLE PRECISION,
  meet_label TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_rides TO authenticated;
GRANT ALL ON public.group_rides TO service_role;
ALTER TABLE public.group_rides ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_ride_members (
  group_ride_id UUID NOT NULL REFERENCES public.group_rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'rider' CHECK (role IN ('host','rider')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_ride_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_ride_members TO authenticated;
GRANT ALL ON public.group_ride_members TO service_role;
ALTER TABLE public.group_ride_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_ride_pings (
  id BIGSERIAL PRIMARY KEY,
  group_ride_id UUID NOT NULL REFERENCES public.group_rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed_kmh REAL,
  heading REAL,
  battery REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX group_ride_pings_ride_created_idx ON public.group_ride_pings (group_ride_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.group_ride_pings TO authenticated;
GRANT ALL ON public.group_ride_pings TO service_role;
ALTER TABLE public.group_ride_pings ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a member?
CREATE OR REPLACE FUNCTION public.is_group_ride_member(_ride UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_ride_members
    WHERE group_ride_id = _ride AND user_id = _user
  );
$$;

-- group_rides policies
CREATE POLICY "members can read ride" ON public.group_rides FOR SELECT TO authenticated
  USING (public.is_group_ride_member(id, auth.uid()) OR host_id = auth.uid());
CREATE POLICY "auth can lookup by code" ON public.group_rides FOR SELECT TO authenticated
  USING (status = 'active');
CREATE POLICY "host can create" ON public.group_rides FOR INSERT TO authenticated
  WITH CHECK (host_id = auth.uid());
CREATE POLICY "host can update" ON public.group_rides FOR UPDATE TO authenticated
  USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "host can delete" ON public.group_rides FOR DELETE TO authenticated
  USING (host_id = auth.uid());

-- members policies
CREATE POLICY "members visible to members" ON public.group_ride_members FOR SELECT TO authenticated
  USING (public.is_group_ride_member(group_ride_id, auth.uid()));
CREATE POLICY "self can join" ON public.group_ride_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "self can leave" ON public.group_ride_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- pings policies
CREATE POLICY "members can read pings" ON public.group_ride_pings FOR SELECT TO authenticated
  USING (public.is_group_ride_member(group_ride_id, auth.uid()));
CREATE POLICY "self can send pings" ON public.group_ride_pings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_group_ride_member(group_ride_id, auth.uid()));
CREATE POLICY "self can delete own pings" ON public.group_ride_pings FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_ride_pings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_ride_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_rides;
