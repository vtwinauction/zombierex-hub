
-- ============ STORAGE: drop broad authenticated read on private buckets ============
DROP POLICY IF EXISTS "storage_public_media_read" ON storage.objects;

-- ============ CREATOR PROFILES ============
-- Tighten reads: full row only for owner; public reads exclude collab_email.
DROP POLICY IF EXISTS "cp_read_all" ON public.creator_profiles;

CREATE POLICY "cp_read_owner" ON public.creator_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cp_read_public_safe" ON public.creator_profiles
  FOR SELECT TO authenticated
  USING (true);

-- Revoke direct SELECT on collab_email; expose owner + opt-in access via SECURITY DEFINER helpers.
REVOKE SELECT (collab_email) ON public.creator_profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_creator_profile()
RETURNS SETOF public.creator_profiles
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.creator_profiles WHERE user_id = auth.uid() LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_my_creator_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_creator_profile() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_creator_collab_email(_creator uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT collab_email FROM public.creator_profiles
  WHERE id = _creator AND accepts_collabs = true AND collab_email IS NOT NULL
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_creator_collab_email(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_creator_collab_email(uuid) TO authenticated;

-- ============ PLATFORM SETTINGS ============
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

UPDATE public.platform_settings SET is_public = true
  WHERE key IN ('maintenance_mode', 'app_version', 'min_client_version', 'announcement_banner');

DROP POLICY IF EXISTS "settings_public_read" ON public.platform_settings;
CREATE POLICY "settings_public_read_flagged" ON public.platform_settings
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "settings_admin_read" ON public.platform_settings
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]));
