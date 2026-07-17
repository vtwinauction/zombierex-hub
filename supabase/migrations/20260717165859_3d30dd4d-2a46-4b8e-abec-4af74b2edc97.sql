
-- Weekly challenges
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hashtag TEXT,
  prize TEXT,
  cover_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  entries_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_challenges TO authenticated;
GRANT SELECT ON public.weekly_challenges TO anon;
GRANT ALL ON public.weekly_challenges TO service_role;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wc_read" ON public.weekly_challenges FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id
    AND (COALESCE(c.is_private,false)=false OR public.is_club_member(c.id, auth.uid())))
);
CREATE POLICY "wc_staff_write" ON public.weekly_challenges FOR INSERT
  WITH CHECK (public.is_club_staff(club_id, auth.uid()));
CREATE POLICY "wc_staff_update" ON public.weekly_challenges FOR UPDATE
  USING (public.is_club_staff(club_id, auth.uid()));
CREATE POLICY "wc_staff_delete" ON public.weekly_challenges FOR DELETE
  USING (public.is_club_staff(club_id, auth.uid()));

CREATE INDEX idx_wc_club_active ON public.weekly_challenges(club_id, is_active, ends_at DESC);
CREATE TRIGGER wc_upd BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Challenge entries
CREATE TABLE public.challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, post_id)
);
GRANT SELECT, INSERT, DELETE ON public.challenge_entries TO authenticated;
GRANT SELECT ON public.challenge_entries TO anon;
GRANT ALL ON public.challenge_entries TO service_role;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ce_read" ON public.challenge_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.weekly_challenges w
    JOIN public.clubs c ON c.id = w.club_id
    WHERE w.id = challenge_id
      AND (COALESCE(c.is_private,false)=false OR public.is_club_member(c.id, auth.uid())))
);
CREATE POLICY "ce_member_insert" ON public.challenge_entries FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.weekly_challenges w
      WHERE w.id = challenge_id AND public.is_club_member(w.club_id, auth.uid()))
  );
CREATE POLICY "ce_owner_or_staff_delete" ON public.challenge_entries FOR DELETE USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.weekly_challenges w
    WHERE w.id = challenge_id AND public.is_club_staff(w.club_id, auth.uid()))
);

CREATE INDEX idx_ce_challenge ON public.challenge_entries(challenge_id, votes_count DESC);

-- Entries counter trigger
CREATE OR REPLACE FUNCTION public.bump_challenge_entries()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.weekly_challenges SET entries_count = entries_count + 1 WHERE id = NEW.challenge_id;
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    UPDATE public.weekly_challenges SET entries_count = GREATEST(entries_count - 1, 0) WHERE id = OLD.challenge_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;$$;
CREATE TRIGGER ce_bump AFTER INSERT OR DELETE ON public.challenge_entries
  FOR EACH ROW EXECUTE FUNCTION public.bump_challenge_entries();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_entries;
