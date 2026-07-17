
-- Extend events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'meet',
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS max_attendees integer,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS hashtags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rules text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS cover_video_url text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photos_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE INDEX IF NOT EXISTS events_starts_at_idx ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS events_visibility_idx ON public.events(visibility);

-- event_photos
CREATE TABLE IF NOT EXISTS public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_photos TO authenticated;
GRANT ALL ON public.event_photos TO service_role;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event photos readable" ON public.event_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "event photos insert own" ON public.event_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event photos delete own or host" ON public.event_photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));
CREATE INDEX IF NOT EXISTS event_photos_event_idx ON public.event_photos(event_id, created_at DESC);

-- event_comments
CREATE TABLE IF NOT EXISTS public.event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_comments TO authenticated;
GRANT ALL ON public.event_comments TO service_role;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event comments readable" ON public.event_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "event comments insert own" ON public.event_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event comments delete own or host" ON public.event_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));
CREATE INDEX IF NOT EXISTS event_comments_event_idx ON public.event_comments(event_id, created_at DESC);

-- event_checkins
CREATE TABLE IF NOT EXISTS public.event_checkins (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_checkins TO authenticated;
GRANT ALL ON public.event_checkins TO service_role;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins readable" ON public.event_checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "checkin as self" ON public.event_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "remove own checkin" ON public.event_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- event_announcements
CREATE TABLE IF NOT EXISTS public.event_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_announcements TO authenticated;
GRANT ALL ON public.event_announcements TO service_role;
ALTER TABLE public.event_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements readable" ON public.event_announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements host only insert" ON public.event_announcements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));
CREATE POLICY "announcements host only delete" ON public.event_announcements FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));
CREATE INDEX IF NOT EXISTS event_ann_event_idx ON public.event_announcements(event_id, created_at DESC);

-- event_invites
CREATE TABLE IF NOT EXISTS public.event_invites (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, invitee_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_invites TO authenticated;
GRANT ALL ON public.event_invites TO service_role;
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites readable by involved" ON public.event_invites FOR SELECT TO authenticated
  USING (auth.uid() = invitee_id OR auth.uid() = inviter_id OR auth.uid() IN (SELECT host_id FROM public.events WHERE id = event_id));
CREATE POLICY "invites insert by self" ON public.event_invites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "invites delete by involved" ON public.event_invites FOR DELETE TO authenticated
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Refresh events RLS to respect visibility
DROP POLICY IF EXISTS "events readable" ON public.events;
DROP POLICY IF EXISTS "events select" ON public.events;
CREATE POLICY "events visibility scoped select" ON public.events FOR SELECT TO authenticated
  USING (
    visibility IN ('public','unlisted')
    OR auth.uid() = host_id
    OR EXISTS (SELECT 1 FROM public.event_rsvps r WHERE r.event_id = id AND r.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.event_invites i WHERE i.event_id = id AND i.invitee_id = auth.uid())
  );

-- Trigger to bump comments/photos counts
CREATE OR REPLACE FUNCTION public.bump_event_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'event_comments' THEN
    IF TG_OP = 'INSERT' THEN UPDATE public.events SET comments_count = comments_count + 1 WHERE id = NEW.event_id; RETURN NEW; END IF;
    IF TG_OP = 'DELETE' THEN UPDATE public.events SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.event_id; RETURN OLD; END IF;
  ELSIF TG_TABLE_NAME = 'event_photos' THEN
    IF TG_OP = 'INSERT' THEN UPDATE public.events SET photos_count = photos_count + 1 WHERE id = NEW.event_id; RETURN NEW; END IF;
    IF TG_OP = 'DELETE' THEN UPDATE public.events SET photos_count = GREATEST(photos_count - 1, 0) WHERE id = OLD.event_id; RETURN OLD; END IF;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_event_comments_bump ON public.event_comments;
CREATE TRIGGER trg_event_comments_bump AFTER INSERT OR DELETE ON public.event_comments
  FOR EACH ROW EXECUTE FUNCTION public.bump_event_counts();

DROP TRIGGER IF EXISTS trg_event_photos_bump ON public.event_photos;
CREATE TRIGGER trg_event_photos_bump AFTER INSERT OR DELETE ON public.event_photos
  FOR EACH ROW EXECUTE FUNCTION public.bump_event_counts();

-- Realtime for live event experience
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_announcements;
