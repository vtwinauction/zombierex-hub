
DROP POLICY IF EXISTS clubs_read ON public.clubs;
CREATE POLICY clubs_read ON public.clubs
  FOR SELECT TO public
  USING (
    COALESCE(is_private, false) = false
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.club_members m WHERE m.club_id = clubs.id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS club_members_read ON public.club_members;
CREATE POLICY club_members_read ON public.club_members
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs c
      WHERE c.id = club_members.club_id
        AND (
          COALESCE(c.is_private, false) = false
          OR c.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.club_members m2 WHERE m2.club_id = c.id AND m2.user_id = auth.uid())
        )
    )
  );
