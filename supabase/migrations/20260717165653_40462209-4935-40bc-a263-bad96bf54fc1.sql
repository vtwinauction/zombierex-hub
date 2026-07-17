
-- Fix recursion: clubs_read references club_members; club_members_read references clubs which re-enters. Use SECURITY DEFINER helpers.

DROP POLICY IF EXISTS "clubs_read" ON public.clubs;
DROP POLICY IF EXISTS "Public clubs visible to all" ON public.clubs;
DROP POLICY IF EXISTS "club_members_read" ON public.club_members;

CREATE POLICY "clubs_read" ON public.clubs
FOR SELECT USING (
  COALESCE(is_private, false) = false
  OR owner_id = auth.uid()
  OR public.is_club_member(id, auth.uid())
);

CREATE POLICY "club_members_read" ON public.club_members
FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_club_member(club_id, auth.uid())
  OR EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND COALESCE(c.is_private,false) = false)
);
