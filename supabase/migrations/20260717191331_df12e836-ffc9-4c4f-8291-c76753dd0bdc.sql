
-- ============ CREATOR PROFILES ============
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'other',
  tagline TEXT,
  portfolio_url TEXT,
  featured_post_ids UUID[] DEFAULT ARRAY[]::UUID[],
  social_links JSONB DEFAULT '{}'::jsonb,
  collab_email TEXT,
  accepts_collabs BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | suspended
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  subscribers_count INTEGER NOT NULL DEFAULT 0,
  tips_total_cents INTEGER NOT NULL DEFAULT 0,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_profiles TO authenticated;
GRANT ALL ON public.creator_profiles TO service_role;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_read_all" ON public.creator_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "cp_owner_insert" ON public.creator_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cp_owner_update" ON public.creator_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','moderator']::public.app_role[]))
  WITH CHECK (user_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','moderator']::public.app_role[]));
CREATE POLICY "cp_admin_delete" ON public.creator_profiles FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::public.app_role[]));

CREATE INDEX cp_status_idx ON public.creator_profiles(status);
CREATE INDEX cp_category_idx ON public.creator_profiles(category);
CREATE INDEX cp_featured_idx ON public.creator_profiles(is_featured) WHERE is_featured = true;

-- ============ CREATOR TIERS ============
CREATE TABLE public.creator_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  benefits TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_tiers TO authenticated;
GRANT ALL ON public.creator_tiers TO service_role;
ALTER TABLE public.creator_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct_read_active" ON public.creator_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "ct_owner_write" ON public.creator_tiers FOR INSERT TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY "ct_owner_update" ON public.creator_tiers FOR UPDATE TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY "ct_owner_delete" ON public.creator_tiers FOR DELETE TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE INDEX ct_creator_idx ON public.creator_tiers(creator_id);

-- ============ CREATOR SUBSCRIPTIONS ============
CREATE TABLE public.creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.creator_tiers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | cancelled | past_due
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (creator_id, subscriber_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_subscriptions TO authenticated;
GRANT ALL ON public.creator_subscriptions TO service_role;
ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_read" ON public.creator_subscriptions FOR SELECT TO authenticated USING (
  subscriber_id = auth.uid()
  OR creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::public.app_role[])
);
CREATE POLICY "cs_self_insert" ON public.creator_subscriptions FOR INSERT TO authenticated WITH CHECK (subscriber_id = auth.uid());
CREATE POLICY "cs_self_update" ON public.creator_subscriptions FOR UPDATE TO authenticated USING (subscriber_id = auth.uid());
CREATE POLICY "cs_self_delete" ON public.creator_subscriptions FOR DELETE TO authenticated USING (subscriber_id = auth.uid());

CREATE INDEX cs_creator_idx ON public.creator_subscriptions(creator_id);
CREATE INDEX cs_subscriber_idx ON public.creator_subscriptions(subscriber_id);

-- Bump subscribers_count on creator_profiles
CREATE OR REPLACE FUNCTION public.bump_creator_subscribers() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP='INSERT' AND NEW.status='active' THEN
    UPDATE public.creator_profiles SET subscribers_count = subscribers_count + 1 WHERE id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP='DELETE' AND OLD.status='active' THEN
    UPDATE public.creator_profiles SET subscribers_count = GREATEST(subscribers_count - 1, 0) WHERE id = OLD.creator_id;
    RETURN OLD;
  ELSIF TG_OP='UPDATE' AND OLD.status='active' AND NEW.status<>'active' THEN
    UPDATE public.creator_profiles SET subscribers_count = GREATEST(subscribers_count - 1, 0) WHERE id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP='UPDATE' AND OLD.status<>'active' AND NEW.status='active' THEN
    UPDATE public.creator_profiles SET subscribers_count = subscribers_count + 1 WHERE id = NEW.creator_id;
    RETURN NEW;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER trg_bump_creator_subscribers
AFTER INSERT OR UPDATE OR DELETE ON public.creator_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.bump_creator_subscribers();

-- ============ CREATOR TIPS ============
CREATE TABLE public.creator_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  message TEXT,
  context TEXT, -- e.g. 'live', 'post', 'profile'
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.creator_tips TO authenticated;
GRANT ALL ON public.creator_tips TO service_role;
ALTER TABLE public.creator_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tip_read" ON public.creator_tips FOR SELECT TO authenticated USING (
  supporter_id = auth.uid()
  OR creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::public.app_role[])
);
CREATE POLICY "tip_self_insert" ON public.creator_tips FOR INSERT TO authenticated WITH CHECK (supporter_id = auth.uid());
CREATE POLICY "tip_supporter_delete" ON public.creator_tips FOR DELETE TO authenticated USING (supporter_id = auth.uid());

CREATE INDEX tip_creator_idx ON public.creator_tips(creator_id);

CREATE OR REPLACE FUNCTION public.bump_creator_tips_total() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.creator_profiles SET tips_total_cents = tips_total_cents + NEW.amount_cents WHERE id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    UPDATE public.creator_profiles SET tips_total_cents = GREATEST(tips_total_cents - OLD.amount_cents, 0) WHERE id = OLD.creator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_bump_tips_total
AFTER INSERT OR DELETE ON public.creator_tips
FOR EACH ROW EXECUTE FUNCTION public.bump_creator_tips_total();

-- ============ POST DRAFTS ============
CREATE TABLE public.post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'photo',
  caption TEXT,
  media_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  hashtags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  visibility TEXT NOT NULL DEFAULT 'public',
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  is_subscribers_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_drafts TO authenticated;
GRANT ALL ON public.post_drafts TO service_role;
ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "draft_owner_all" ON public.post_drafts FOR ALL TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE INDEX draft_author_idx ON public.post_drafts(author_id);

-- ============ SCHEDULED POSTS ============
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'photo',
  caption TEXT,
  media_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  hashtags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  visibility TEXT NOT NULL DEFAULT 'public',
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  is_subscribers_only BOOLEAN NOT NULL DEFAULT false,
  publish_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | published | failed | cancelled
  published_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_posts TO authenticated;
GRANT ALL ON public.scheduled_posts TO service_role;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sched_owner_all" ON public.scheduled_posts FOR ALL TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE INDEX sched_author_idx ON public.scheduled_posts(author_id);
CREATE INDEX sched_pending_idx ON public.scheduled_posts(publish_at) WHERE status = 'pending';

-- ============ COLLAB REQUESTS ============
CREATE TABLE public.collab_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_website TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  campaign_type TEXT, -- sponsorship | product_seed | ambassador | ugc | other
  budget_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'new', -- new | read | replied | accepted | declined | archived
  read_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collab_requests TO authenticated;
GRANT ALL ON public.collab_requests TO service_role;
ALTER TABLE public.collab_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collab_read" ON public.collab_requests FOR SELECT TO authenticated USING (
  sender_id = auth.uid()
  OR creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','moderator']::public.app_role[])
);
CREATE POLICY "collab_sender_insert" ON public.collab_requests FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "collab_creator_update" ON public.collab_requests FOR UPDATE TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));
CREATE POLICY "collab_participant_delete" ON public.collab_requests FOR DELETE TO authenticated USING (
  sender_id = auth.uid()
  OR creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
);

CREATE INDEX collab_creator_idx ON public.collab_requests(creator_id, status);

-- ============ updated_at triggers ============
CREATE TRIGGER trg_cp_updated BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ct_updated BEFORE UPDATE ON public.creator_tiers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cs_updated BEFORE UPDATE ON public.creator_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_draft_updated BEFORE UPDATE ON public.post_drafts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sched_updated BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_collab_updated BEFORE UPDATE ON public.collab_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
