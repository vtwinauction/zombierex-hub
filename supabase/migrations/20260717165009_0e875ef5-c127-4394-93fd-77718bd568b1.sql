
-- Extend clubs (communities) with rich metadata
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS rules text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS hashtags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS join_policy text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS activity_score integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS clubs_category_idx ON public.clubs(category);
CREATE INDEX IF NOT EXISTS clubs_location_idx ON public.clubs(location);
CREATE INDEX IF NOT EXISTS clubs_activity_idx ON public.clubs(activity_score DESC);

-- Community join requests
CREATE TABLE IF NOT EXISTS public.club_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid,
  UNIQUE (club_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_join_requests TO authenticated;
GRANT ALL ON public.club_join_requests TO service_role;
ALTER TABLE public.club_join_requests ENABLE ROW LEVEL SECURITY;

-- Helper: is user moderator or owner
CREATE OR REPLACE FUNCTION public.is_club_staff(_club uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = _club AND user_id = _user AND role IN ('owner','moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_club_member(_club uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = _club AND user_id = _user AND role <> 'pending'
  );
$$;

CREATE POLICY "Users can create their own join requests"
  ON public.club_join_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
  ON public.club_join_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_club_staff(club_id, auth.uid()));

CREATE POLICY "Staff can update requests"
  ON public.club_join_requests FOR UPDATE TO authenticated
  USING (public.is_club_staff(club_id, auth.uid()));

CREATE POLICY "User or staff can delete request"
  ON public.club_join_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_club_staff(club_id, auth.uid()));

-- Extend posts to be scoped to a community and support pins / announcements / polls
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_announcement boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS poll jsonb;

CREATE INDEX IF NOT EXISTS posts_club_idx ON public.posts(club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_club_pinned_idx ON public.posts(club_id) WHERE is_pinned;

-- Extend events with community-friendly fields
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'meet',
  ADD COLUMN IF NOT EXISTS guest_limit integer,
  ADD COLUMN IF NOT EXISTS gps_lat double precision,
  ADD COLUMN IF NOT EXISTS gps_lng double precision;

-- Community achievements / badges
CREATE TABLE IF NOT EXISTS public.club_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id, code)
);

GRANT SELECT, INSERT, DELETE ON public.club_badges TO authenticated;
GRANT ALL ON public.club_badges TO service_role;
ALTER TABLE public.club_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badges" ON public.club_badges
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Staff can award badges" ON public.club_badges
  FOR INSERT TO authenticated
  WITH CHECK (public.is_club_staff(club_id, auth.uid()));

CREATE POLICY "Staff can revoke badges" ON public.club_badges
  FOR DELETE TO authenticated
  USING (public.is_club_staff(club_id, auth.uid()));

-- Allow anon to read public clubs list (already had SELECT policy for members-only; broaden to public clubs)
DROP POLICY IF EXISTS "Public clubs visible to all" ON public.clubs;
CREATE POLICY "Public clubs visible to all" ON public.clubs
  FOR SELECT TO anon, authenticated
  USING (is_private = false OR public.is_club_member(id, auth.uid()));

GRANT SELECT ON public.clubs TO anon;
