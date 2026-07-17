
-- ============ VENDOR SHOWCASE FIELDS ============
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_showcase jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS products_showcase jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_channels jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz,
  ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_views_count integer NOT NULL DEFAULT 0;

-- ============ AD CAMPAIGNS ============
DO $$ BEGIN
  CREATE TYPE public.ad_objective AS ENUM (
    'followers','profile_visits','post_engagement','event_attendance',
    'listing_views','website_visits','direct_messages'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ad_status AS ENUM ('draft','pending','active','paused','completed','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ad_placement AS ENUM ('feed','reels','stories','explore','marketplace','communities','search');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ad_creative_kind AS ENUM (
    'post','reel','story','event','listing','community','business_profile','creator_profile'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  name text NOT NULL,
  objective public.ad_objective NOT NULL,
  status public.ad_status NOT NULL DEFAULT 'draft',
  budget_total_cents integer NOT NULL DEFAULT 0,
  budget_daily_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  start_at timestamptz,
  end_at timestamptz,
  placements public.ad_placement[] NOT NULL DEFAULT ARRAY['feed']::public.ad_placement[],
  geo_countries text[] NOT NULL DEFAULT '{}',
  geo_cities text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  age_min integer,
  age_max integer,
  targeting jsonb NOT NULL DEFAULT '{}'::jsonb,
  impressions_count integer NOT NULL DEFAULT 0,
  clicks_count integer NOT NULL DEFAULT 0,
  engagements_count integer NOT NULL DEFAULT 0,
  spent_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_campaigns TO authenticated;
GRANT ALL ON public.ad_campaigns TO service_role;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own campaigns" ON public.ad_campaigns
  FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners create campaigns" ON public.ad_campaigns
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update campaigns" ON public.ad_campaigns
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_owner ON public.ad_campaigns(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status, end_at);

CREATE TRIGGER ad_campaigns_set_updated
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AD CREATIVES ============
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  kind public.ad_creative_kind NOT NULL,
  ref_id uuid,
  headline text,
  body text,
  cta_label text,
  cta_url text,
  media_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ad_creatives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_creatives TO authenticated;
GRANT ALL ON public.ad_creatives TO service_role;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active creatives" ON public.ad_creatives
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.ad_campaigns c
      WHERE c.id = campaign_id AND c.status = 'active'
    )
  );
CREATE POLICY "Owners manage creatives" ON public.ad_creatives
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ad_campaigns c WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ad_campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign ON public.ad_creatives(campaign_id, sort_order);

CREATE TRIGGER ad_creatives_set_updated
  BEFORE UPDATE ON public.ad_creatives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AD EVENTS (impressions / clicks / engagements) ============
DO $$ BEGIN
  CREATE TYPE public.ad_event_kind AS ENUM ('impression','click','engagement','conversion');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.ad_events (
  id bigserial PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_id uuid REFERENCES public.ad_creatives(id) ON DELETE SET NULL,
  kind public.ad_event_kind NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  placement public.ad_placement,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.ad_events TO authenticated;
GRANT SELECT ON public.ad_events TO authenticated;
GRANT ALL ON public.ad_events TO service_role;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in logs events" ON public.ad_events
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners read own events" ON public.ad_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.ad_campaigns c WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
  );

CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON public.ad_events(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_kind ON public.ad_events(campaign_id, kind, created_at DESC);

-- Bump counters trigger
CREATE OR REPLACE FUNCTION public.bump_ad_campaign_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.kind = 'impression' THEN
    UPDATE public.ad_campaigns SET impressions_count = impressions_count + 1 WHERE id = NEW.campaign_id;
  ELSIF NEW.kind = 'click' THEN
    UPDATE public.ad_campaigns SET clicks_count = clicks_count + 1 WHERE id = NEW.campaign_id;
  ELSIF NEW.kind = 'engagement' THEN
    UPDATE public.ad_campaigns SET engagements_count = engagements_count + 1 WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS ad_events_bump ON public.ad_events;
CREATE TRIGGER ad_events_bump
  AFTER INSERT ON public.ad_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_ad_campaign_counters();

-- ============ BUSINESS REVIEWS ============
CREATE TABLE IF NOT EXISTS public.business_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, reviewer_id)
);
GRANT SELECT ON public.business_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_reviews TO authenticated;
GRANT ALL ON public.business_reviews TO service_role;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads business reviews" ON public.business_reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers write own" ON public.business_reviews
  FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Reviewers update own" ON public.business_reviews
  FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Reviewers delete own" ON public.business_reviews
  FOR DELETE TO authenticated USING (reviewer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_business_reviews_vendor ON public.business_reviews(vendor_id, created_at DESC);

CREATE TRIGGER business_reviews_set_updated
  BEFORE UPDATE ON public.business_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
