
-- Tighten creator_profiles public read: only approved rows, and revoke collab_email
DROP POLICY IF EXISTS cp_read_public_safe ON public.creator_profiles;

CREATE POLICY cp_read_public_approved
  ON public.creator_profiles
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Column-level: prevent broad access to collab_email; owners use get_my_creator_profile RPC,
-- collaborators use get_creator_collab_email RPC.
REVOKE SELECT (collab_email) ON public.creator_profiles FROM authenticated, anon;
