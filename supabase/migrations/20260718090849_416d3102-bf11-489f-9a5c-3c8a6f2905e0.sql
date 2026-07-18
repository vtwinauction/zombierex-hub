
-- USER BLOCKS
CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks_owner_read" ON public.user_blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "blocks_owner_write" ON public.user_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocks_owner_delete" ON public.user_blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- USER MUTES
CREATE TABLE public.user_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(muter_id, muted_id),
  CHECK (muter_id <> muted_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_mutes TO authenticated;
GRANT ALL ON public.user_mutes TO service_role;
ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mutes_owner_all" ON public.user_mutes FOR ALL TO authenticated USING (auth.uid() = muter_id) WITH CHECK (auth.uid() = muter_id);

-- MODERATION ACTIONS
CREATE TABLE public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_kind text,
  target_id uuid,
  action text NOT NULL CHECK (action IN ('warn','suspend','ban','restore','remove_content','shadow_ban')),
  reason text,
  duration_hours integer,
  expires_at timestamptz,
  issued_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.moderation_actions TO authenticated;
GRANT ALL ON public.moderation_actions TO service_role;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mod_actions_admin_all" ON public.moderation_actions FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE POLICY "mod_actions_self_read" ON public.moderation_actions FOR SELECT TO authenticated
  USING (auth.uid() = target_user_id);
CREATE INDEX moderation_actions_target_user_idx ON public.moderation_actions(target_user_id, status);

-- APPEALS
CREATE TABLE public.appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id uuid REFERENCES public.moderation_actions(id) ON DELETE SET NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.appeals TO authenticated;
GRANT ALL ON public.appeals TO service_role;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appeals_self_read" ON public.appeals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "appeals_self_insert" ON public.appeals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appeals_admin_all" ON public.appeals FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE TRIGGER appeals_updated_at BEFORE UPDATE ON public.appeals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- KEYWORD FILTERS
CREATE TABLE public.keyword_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'user' CHECK (scope IN ('user','global')),
  keyword text NOT NULL,
  match_type text NOT NULL DEFAULT 'contains' CHECK (match_type IN ('contains','exact','regex')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keyword_filters TO authenticated;
GRANT ALL ON public.keyword_filters TO service_role;
ALTER TABLE public.keyword_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kw_user_own" ON public.keyword_filters FOR ALL TO authenticated
  USING (scope = 'user' AND auth.uid() = user_id)
  WITH CHECK (scope = 'user' AND auth.uid() = user_id);
CREATE POLICY "kw_global_read" ON public.keyword_filters FOR SELECT TO authenticated USING (scope = 'global');
CREATE POLICY "kw_global_admin_write" ON public.keyword_filters FOR ALL TO authenticated
  USING (scope = 'global' AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (scope = 'global' AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));

-- FEATURE FLAGS
CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percent integer NOT NULL DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
  audience jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO authenticated, anon;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags_public_read" ON public.feature_flags FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "flags_admin_write" ON public.feature_flags FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PLATFORM SETTINGS
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO authenticated, anon;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.platform_settings FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "settings_admin_write" ON public.platform_settings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));

INSERT INTO public.platform_settings(key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": null}'::jsonb),
  ('signup_open', '{"enabled": true}'::jsonb),
  ('platform_version', '"1.0.0"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- SEED CORE FEATURE FLAGS
INSERT INTO public.feature_flags(key, description, enabled, rollout_percent) VALUES
  ('reels_autoplay', 'Autoplay videos in reels feed', true, 100),
  ('ai_assist', 'Show REX AI assistant surfaces', true, 100),
  ('marketplace', 'Enable marketplace section', true, 100),
  ('events', 'Enable events section', true, 100),
  ('communities', 'Enable communities section', true, 100),
  ('creator_monetization', 'Show tips and paid tiers', true, 100),
  ('push_notifications', 'Web push notifications', false, 0)
ON CONFLICT (key) DO NOTHING;

-- API KEYS (developer platform)
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prefix text NOT NULL,
  key_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_keys_owner_all" ON public.api_keys FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- WEBHOOKS
CREATE TABLE public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY[]::text[],
  active boolean NOT NULL DEFAULT true,
  last_delivered_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT ALL ON public.webhooks TO service_role;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_owner_all" ON public.webhooks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "webhooks_admin_all" ON public.webhooks FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));
