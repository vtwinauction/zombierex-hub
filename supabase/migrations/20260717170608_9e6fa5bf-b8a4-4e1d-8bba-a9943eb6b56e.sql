
CREATE TABLE public.challenge_entry_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.challenge_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entry_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.challenge_entry_votes TO authenticated;
GRANT SELECT ON public.challenge_entry_votes TO anon;
GRANT ALL ON public.challenge_entry_votes TO service_role;

ALTER TABLE public.challenge_entry_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes"
  ON public.challenge_entry_votes FOR SELECT
  USING (true);

CREATE POLICY "Members can vote in their communities"
  ON public.challenge_entry_votes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.challenge_entries ce
      JOIN public.weekly_challenges wc ON wc.id = ce.challenge_id
      WHERE ce.id = challenge_entry_votes.entry_id
        AND public.is_club_member(wc.club_id, auth.uid())
    )
  );

CREATE POLICY "Users delete their own votes"
  ON public.challenge_entry_votes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Vote counter trigger
CREATE OR REPLACE FUNCTION public.bump_challenge_entry_votes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_entries
       SET votes_count = votes_count + 1
     WHERE id = NEW.entry_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_entries
       SET votes_count = GREATEST(votes_count - 1, 0)
     WHERE id = OLD.entry_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS bump_challenge_entry_votes_trg ON public.challenge_entry_votes;
CREATE TRIGGER bump_challenge_entry_votes_trg
AFTER INSERT OR DELETE ON public.challenge_entry_votes
FOR EACH ROW EXECUTE FUNCTION public.bump_challenge_entry_votes();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_entry_votes;
