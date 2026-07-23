
-- is_owner helper (SECURITY DEFINER — no RLS recursion)
CREATE OR REPLACE FUNCTION public.is_owner(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user AND role = 'owner'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated, service_role;

-- Protect the last owner from being deleted or demoted
CREATE OR REPLACE FUNCTION public.tg_protect_last_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE owner_count int;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'owner')
     OR (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role <> 'owner') THEN
    SELECT COUNT(*) INTO owner_count FROM public.user_roles WHERE role = 'owner';
    IF owner_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last remaining owner';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS protect_last_owner ON public.user_roles;
CREATE TRIGGER protect_last_owner
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.tg_protect_last_owner();

-- FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.feature_flags_v2 (
  key text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'core',
  enabled boolean NOT NULL DEFAULT true,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags_v2 TO anon, authenticated;
GRANT ALL ON public.feature_flags_v2 TO service_role;
ALTER TABLE public.feature_flags_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags readable" ON public.feature_flags_v2 FOR SELECT USING (true);
CREATE POLICY "flags writable by owner" ON public.feature_flags_v2
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

INSERT INTO public.feature_flags_v2 (key, label, category, enabled, description) VALUES
  ('marketplace','Marketplace','commerce',true,'The Vault — buy & sell vehicles/parts'),
  ('messaging','Direct Messages','social',true,'One-to-one and group chats'),
  ('groups','Clubs & Groups','social',true,'Community clubs and group chats'),
  ('events','Events & Rides','social',true,'Event RSVP, meetups, group rides'),
  ('notifications','Notifications','core',true,'Push and in-app notifications'),
  ('ai','AI Features','ai',true,'REX AI coach, judge, and analytics'),
  ('live','Live Streaming','media',true,'Live video sessions'),
  ('garage','Digital Garage','core',true,'Vehicle profiles and dossiers'),
  ('search','Search & Discovery','core',true,'Global search and discovery feed'),
  ('registration','New Registrations','core',true,'Allow new users to sign up'),
  ('uploads','Media Uploads','core',true,'Photo and video uploads'),
  ('posting','Posting','core',true,'Creating new posts and reels'),
  ('drag_racing','Drag Racing','motorsport',true,'Verified drag race timing'),
  ('judge','AI Judge','ai',true,'AI vehicle judging & scoring'),
  ('atlas','Route Atlas','navigation',true,'GPS route recording & sharing')
ON CONFLICT (key) DO NOTHING;

-- MAINTENANCE STATE
CREATE TABLE IF NOT EXISTS public.maintenance_state (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  global_enabled boolean NOT NULL DEFAULT false,
  message text,
  scheduled_until timestamptz,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.maintenance_state (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.maintenance_state TO anon, authenticated;
GRANT ALL ON public.maintenance_state TO service_role;
ALTER TABLE public.maintenance_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maint readable" ON public.maintenance_state FOR SELECT USING (true);
CREATE POLICY "maint owner writes" ON public.maintenance_state
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

CREATE TABLE IF NOT EXISTS public.module_maintenance (
  module_key text PRIMARY KEY REFERENCES public.feature_flags_v2(key) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  message text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.module_maintenance TO anon, authenticated;
GRANT ALL ON public.module_maintenance TO service_role;
ALTER TABLE public.module_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mm readable" ON public.module_maintenance FOR SELECT USING (true);
CREATE POLICY "mm owner writes" ON public.module_maintenance
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- OWNER AUDIT LOG
CREATE TABLE IF NOT EXISTS public.owner_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  before_value jsonb,
  after_value jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oal_actor_created ON public.owner_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oal_action_created ON public.owner_audit_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oal_created ON public.owner_audit_log (created_at DESC);
GRANT SELECT, INSERT ON public.owner_audit_log TO authenticated;
GRANT ALL ON public.owner_audit_log TO service_role;
ALTER TABLE public.owner_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oal owner reads" ON public.owner_audit_log
  FOR SELECT TO authenticated USING (public.is_owner(auth.uid()));
CREATE POLICY "oal owner inserts" ON public.owner_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_owner(auth.uid()) AND actor_id = auth.uid());

-- OWNER BROADCASTS
CREATE TABLE IF NOT EXISTS public.owner_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ob_active_created ON public.owner_broadcasts (active, created_at DESC);
GRANT SELECT ON public.owner_broadcasts TO anon, authenticated;
GRANT ALL ON public.owner_broadcasts TO service_role;
ALTER TABLE public.owner_broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ob public reads active" ON public.owner_broadcasts
  FOR SELECT USING (active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "ob owner full read" ON public.owner_broadcasts
  FOR SELECT TO authenticated USING (public.is_owner(auth.uid()));
CREATE POLICY "ob owner writes" ON public.owner_broadcasts
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- USER SUSPENSION + VERIFIED BADGE
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "owner full profile access" ON public.profiles;
CREATE POLICY "owner full profile access" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

DROP POLICY IF EXISTS "owner manages roles" ON public.user_roles;
CREATE POLICY "owner manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

DROP POLICY IF EXISTS "owner reads audit_log" ON public.audit_log;
CREATE POLICY "owner reads audit_log" ON public.audit_log
  FOR SELECT TO authenticated USING (public.is_owner(auth.uid()));

-- updated_at triggers
DROP TRIGGER IF EXISTS ff2_touch ON public.feature_flags_v2;
CREATE TRIGGER ff2_touch BEFORE UPDATE ON public.feature_flags_v2
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS maint_touch ON public.maintenance_state;
CREATE TRIGGER maint_touch BEFORE UPDATE ON public.maintenance_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS modmaint_touch ON public.module_maintenance;
CREATE TRIGGER modmaint_touch BEFORE UPDATE ON public.module_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
