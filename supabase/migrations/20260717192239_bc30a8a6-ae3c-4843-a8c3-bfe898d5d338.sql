
DO $$ BEGIN
  CREATE TYPE public.listing_category AS ENUM (
    'motorcycle','car','truck','scooter','atv','boat','other_vehicle',
    'parts','accessories','riding_gear','apparel','collectibles',
    'tools','garage_equipment','electronics','services'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_condition AS ENUM ('new','like_new','used','for_parts','refurbished');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_fuel AS ENUM ('gasoline','diesel','electric','hybrid','other','na');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_transmission AS ENUM ('manual','automatic','semi_auto','cvt','dct','na');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_report_status AS ENUM ('open','reviewing','resolved','dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS category public.listing_category NOT NULL DEFAULT 'other_vehicle',
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS condition public.listing_condition NOT NULL DEFAULT 'used',
  ADD COLUMN IF NOT EXISTS is_negotiable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS fuel_type public.listing_fuel NOT NULL DEFAULT 'na',
  ADD COLUMN IF NOT EXISTS transmission public.listing_transmission NOT NULL DEFAULT 'na',
  ADD COLUMN IF NOT EXISTS engine_cc integer,
  ADD COLUMN IF NOT EXISTS mileage_km integer,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS vin text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photos_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz;

CREATE INDEX IF NOT EXISTS listings_category_status_idx ON public.listings (category, status, published_at DESC);
CREATE INDEX IF NOT EXISTS listings_seller_idx ON public.listings (seller_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS listings_featured_idx ON public.listings (is_featured, published_at DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS listings_price_idx ON public.listings (price_cents) WHERE status='active';
CREATE INDEX IF NOT EXISTS listings_geo_idx ON public.listings (latitude, longitude) WHERE status='active';
CREATE INDEX IF NOT EXISTS listings_title_trgm_idx ON public.listings USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS listings_brand_trgm_idx ON public.listings USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS listings_tags_idx ON public.listings USING gin (tags);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='listings' AND policyname='listings_public_read') THEN
    DROP POLICY listings_public_read ON public.listings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='listings' AND policyname='listings_active_read') THEN
    DROP POLICY listings_active_read ON public.listings;
  END IF;
END $$;

CREATE POLICY listings_active_read ON public.listings
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR seller_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumbnail_url text,
  is_video boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listing_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_photos TO authenticated;
GRANT ALL ON public.listing_photos TO service_role;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY listing_photos_read ON public.listing_photos
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND (l.status='active' OR l.seller_id = auth.uid())));

CREATE POLICY listing_photos_write ON public.listing_photos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()));

CREATE INDEX IF NOT EXISTS listing_photos_listing_idx ON public.listing_photos (listing_id, sort_order);

CREATE TABLE IF NOT EXISTS public.listing_saves (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
GRANT SELECT, INSERT, DELETE ON public.listing_saves TO authenticated;
GRANT ALL ON public.listing_saves TO service_role;
ALTER TABLE public.listing_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY listing_saves_own ON public.listing_saves
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS listing_saves_listing_idx ON public.listing_saves (listing_id);

CREATE TABLE IF NOT EXISTS public.listing_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  note text,
  status public.listing_report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, reporter_id)
);
GRANT SELECT, INSERT ON public.listing_reports TO authenticated;
GRANT ALL ON public.listing_reports TO service_role;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY listing_reports_insert_own ON public.listing_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY listing_reports_read_own ON public.listing_reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TABLE IF NOT EXISTS public.seller_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, reviewer_id, listing_id)
);
GRANT SELECT ON public.seller_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_reviews TO authenticated;
GRANT ALL ON public.seller_reviews TO service_role;
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY seller_reviews_read ON public.seller_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY seller_reviews_write_own ON public.seller_reviews
  FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid() AND reviewer_id <> seller_id);
CREATE POLICY seller_reviews_update_own ON public.seller_reviews
  FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY seller_reviews_delete_own ON public.seller_reviews
  FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

CREATE INDEX IF NOT EXISTS seller_reviews_seller_idx ON public.seller_reviews (seller_id, created_at DESC);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS seller_rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_reviews_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listings_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.bump_listing_saves()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.listings SET saves_count = saves_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    UPDATE public.listings SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_bump_listing_saves ON public.listing_saves;
CREATE TRIGGER trg_bump_listing_saves AFTER INSERT OR DELETE ON public.listing_saves
FOR EACH ROW EXECUTE FUNCTION public.bump_listing_saves();

CREATE OR REPLACE FUNCTION public.bump_listing_photos_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.listings SET photos_count = photos_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    UPDATE public.listings SET photos_count = GREATEST(photos_count - 1, 0) WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_bump_listing_photos ON public.listing_photos;
CREATE TRIGGER trg_bump_listing_photos AFTER INSERT OR DELETE ON public.listing_photos
FOR EACH ROW EXECUTE FUNCTION public.bump_listing_photos_count();

CREATE OR REPLACE FUNCTION public.refresh_seller_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE sid uuid;
BEGIN
  sid := COALESCE(NEW.seller_id, OLD.seller_id);
  UPDATE public.profiles p
  SET seller_rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.seller_reviews WHERE seller_id = sid), 0),
      seller_reviews_count = COALESCE((SELECT COUNT(*) FROM public.seller_reviews WHERE seller_id = sid), 0)
  WHERE p.id = sid;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_refresh_seller_rating ON public.seller_reviews;
CREATE TRIGGER trg_refresh_seller_rating AFTER INSERT OR UPDATE OR DELETE ON public.seller_reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_seller_rating();

CREATE OR REPLACE FUNCTION public.bump_listings_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.profiles SET listings_count = listings_count + 1 WHERE id = NEW.seller_id;
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    UPDATE public.profiles SET listings_count = GREATEST(listings_count - 1, 0) WHERE id = OLD.seller_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_bump_listings_count ON public.listings;
CREATE TRIGGER trg_bump_listings_count AFTER INSERT OR DELETE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.bump_listings_count();
