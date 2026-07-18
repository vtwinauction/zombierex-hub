
-- ============================================================
-- PROFILE COLUMNS: XP + level + premium flag + customization
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_checkin_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_theme text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS featured_badge_slug text,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Backfill referral codes for existing users
UPDATE public.profiles
SET referral_code = UPPER(SUBSTR(REPLACE(id::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- ============================================================
-- XP EVENTS (append-only ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,                -- e.g. 'post_created','reel_created','checkin','event_join'
  amount integer NOT NULL,           -- XP amount
  ref_kind text,                     -- e.g. 'post','event','challenge'
  ref_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xp_events_own_read" ON public.xp_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "xp_events_own_write" ON public.xp_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS xp_events_user_created_idx ON public.xp_events(user_id, created_at DESC);

-- Level calc helper: level = 1 + floor(sqrt(xp/100))
CREATE OR REPLACE FUNCTION public.calc_level(_xp integer)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT GREATEST(1, 1 + FLOOR(SQRT(GREATEST(_xp,0)::numeric / 100))::integer)
$$;

-- Trigger: bump profile xp_total + level on new xp_events
CREATE OR REPLACE FUNCTION public.apply_xp_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_total integer;
BEGIN
  UPDATE public.profiles
    SET xp_total = xp_total + NEW.amount
    WHERE id = NEW.user_id
    RETURNING xp_total INTO new_total;
  IF new_total IS NOT NULL THEN
    UPDATE public.profiles SET level = public.calc_level(new_total) WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS xp_events_apply ON public.xp_events;
CREATE TRIGGER xp_events_apply
  AFTER INSERT ON public.xp_events
  FOR EACH ROW EXECUTE FUNCTION public.apply_xp_event();

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  slug text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  tier text NOT NULL DEFAULT 'bronze', -- bronze|silver|gold|platinum|legend
  xp_reward integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  is_hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO authenticated, anon;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "achievements_admin_write" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_slug text NOT NULL REFERENCES public.achievements(slug) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  target integer NOT NULL DEFAULT 1,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_slug)
);
GRANT SELECT, INSERT, UPDATE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ua_read_public" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "ua_own_upsert" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ua_own_update" ON public.user_achievements FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS ua_user_idx ON public.user_achievements(user_id);

-- ============================================================
-- CHALLENGES (platform-wide daily/weekly/seasonal)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gamification_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  cadence text NOT NULL DEFAULT 'daily', -- daily|weekly|seasonal
  goal_kind text NOT NULL,               -- 'post_created','reel_created','checkin','event_join','comment_created','invite_sent','community_join'
  goal_count integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 50,
  badge_slug text REFERENCES public.achievements(slug),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gamification_challenges TO authenticated, anon;
GRANT ALL ON public.gamification_challenges TO service_role;
ALTER TABLE public.gamification_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gc_read" ON public.gamification_challenges FOR SELECT USING (true);
CREATE POLICY "gc_admin_write" ON public.gamification_challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.gamification_challenges(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
GRANT SELECT, INSERT, UPDATE ON public.user_challenges TO authenticated;
GRANT ALL ON public.user_challenges TO service_role;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uc_own_read" ON public.user_challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "uc_own_upsert" ON public.user_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uc_own_update" ON public.user_challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending|activated|rewarded
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ref_read_own" ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "ref_insert_own" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);
CREATE INDEX IF NOT EXISTS ref_referrer_idx ON public.referrals(referrer_id);

-- ============================================================
-- PREMIUM MEMBERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.premium_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'apex', -- apex|legend
  status text NOT NULL DEFAULT 'active', -- active|canceled|expired
  started_at timestamptz NOT NULL DEFAULT now(),
  renews_at timestamptz,
  expires_at timestamptz,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.premium_memberships TO authenticated;
GRANT ALL ON public.premium_memberships TO service_role;
ALTER TABLE public.premium_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_own_read" ON public.premium_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pm_own_insert" ON public.premium_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pm_own_update" ON public.premium_memberships FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Keep profiles.is_premium in sync
CREATE OR REPLACE FUNCTION public.sync_profile_premium()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
    SET is_premium = EXISTS(
      SELECT 1 FROM public.premium_memberships
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > now())
    )
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS pm_sync_profile ON public.premium_memberships;
CREATE TRIGGER pm_sync_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.premium_memberships
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_premium();

-- ============================================================
-- SEED: baseline achievements + starter challenges
-- ============================================================
INSERT INTO public.achievements (slug, title, description, icon, tier, xp_reward, category, sort_order) VALUES
  ('first_post',         'First Post',         'Publish your first post',                        'sparkles',  'bronze',   50, 'social',      10),
  ('first_reel',         'First Reel',         'Upload your first reel',                         'video',     'bronze',   75, 'social',      20),
  ('first_story',        'First Story',        'Share your first story',                         'camera',    'bronze',   40, 'social',      30),
  ('verified_creator',   'Verified Creator',   'Get approved as a verified creator',             'shield',    'gold',    500, 'creator',    100),
  ('community_leader',   'Community Leader',   'Start a community and grow it past 50 members',  'users',     'gold',    400, 'community',  110),
  ('event_organizer',    'Event Organizer',    'Host an event with 25+ attendees',               'calendar',  'gold',    400, 'event',      120),
  ('top_photographer',   'Top Photographer',   'Win a photo challenge',                          'camera',    'platinum',600, 'creator',    130),
  ('top_builder',        'Top Builder',        'Feature a build that trends',                    'wrench',    'platinum',600, 'creator',    140),
  ('top_racer',          'Top Racer',          'Log a track day event',                          'flag',      'silver',  200, 'motorsport', 150),
  ('marketplace_seller', 'Marketplace Seller', 'Complete a sale in the Vault',                   'store',     'silver',  200, 'marketplace',160),
  ('early_supporter',    'Early Supporter',    'Joined during the first season',                 'star',      'legend', 1000, 'legacy',       1),
  ('anniversary_member', 'Anniversary',        'One full year on ZOMBIEREX',                     'medal',     'gold',    500, 'legacy',       2),
  ('trending_creator',   'Trending Creator',   'Land in the Top 10 creators for a week',         'flame',     'platinum',800, 'creator',    170),
  ('streak_7',           '7-Day Streak',       'Check in seven days in a row',                   'flame',     'silver',  150, 'loyalty',     50),
  ('streak_30',          '30-Day Streak',      'Check in thirty days in a row',                  'flame',     'gold',    500, 'loyalty',     60),
  ('referral_3',         'Recruiter',          'Invite 3 friends who join',                      'gift',      'silver',  250, 'growth',      70)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.gamification_challenges (slug, title, description, cadence, goal_kind, goal_count, xp_reward) VALUES
  ('daily_checkin',     'Daily Check-in',       'Open ZOMBIEREX today',                'daily',    'checkin',        1,  20),
  ('daily_engage',      'Engage a Rider',       'Leave a comment on any post',         'daily',    'comment_created',1,  15),
  ('weekly_reel',       'Weekly Reel',          'Upload a reel this week',             'weekly',   'reel_created',   1, 150),
  ('weekly_community',  'Community Pulse',      'Post in a community this week',       'weekly',   'post_created',   3, 120),
  ('weekly_event',      'Ride Out',             'Join an event this week',             'weekly',   'event_join',     1, 100),
  ('seasonal_invite',   'Grow the Pack',        'Invite 3 friends this season',        'seasonal', 'invite_sent',    3, 500)
ON CONFLICT (slug) DO NOTHING;

-- Revoke execute defaults on new SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.calc_level(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.calc_level(integer) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_xp_event() FROM public;
REVOKE EXECUTE ON FUNCTION public.sync_profile_premium() FROM public;
