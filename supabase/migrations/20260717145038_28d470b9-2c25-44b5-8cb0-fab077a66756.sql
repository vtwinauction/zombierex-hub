
-- Expand vendors table with full business profile
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS business_type TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS trade_license_no TEXT,
  ADD COLUMN IF NOT EXISTS tax_number TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS service_areas TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS verification_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Constrain enum-like fields
DO $$ BEGIN
  ALTER TABLE public.vendors ADD CONSTRAINT vendors_verification_status_chk
    CHECK (verification_status IN ('draft','pending','approved','rejected','info_requested','suspended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.vendors ADD CONSTRAINT vendors_business_type_chk
    CHECK (business_type IN (
      'motorcycle_workshop','car_workshop','dealership','spare_parts','performance_shop',
      'tire_shop','detailing','builder','rental','towing','insurance','training_school',
      'motorcycle_club','automotive_brand','other'
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Link subscriptions to a specific vendor (optional; billed per business)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_subscriptions_vendor ON public.subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_verification ON public.vendors(verification_status);
CREATE INDEX IF NOT EXISTS idx_vendors_owner ON public.vendors(owner_id);

-- Owners must always see their own vendor row, even before verification (existing policy is USING (true) which is fine)

-- Vendor owners manage their own subscriptions
DROP POLICY IF EXISTS "subs_owner_insert" ON public.subscriptions;
CREATE POLICY "subs_owner_insert" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "subs_owner_update" ON public.subscriptions;
CREATE POLICY "subs_owner_update" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Seed the five subscription plans
INSERT INTO public.subscription_plans (code, name, price_cents, currency, interval, features, is_active) VALUES
  ('free', 'Free', 0, 'USD', 'month', '{
    "products": 5, "services": 3, "storage_mb": 250, "staff": 1,
    "ad_credits": 0, "analytics": "basic", "bookings": true,
    "visibility": "standard", "messages_per_day": 25
  }'::jsonb, true),
  ('starter', 'Starter', 1900, 'USD', 'month', '{
    "products": 25, "services": 10, "storage_mb": 2000, "staff": 2,
    "ad_credits": 10, "analytics": "basic", "bookings": true,
    "visibility": "boosted", "messages_per_day": 100
  }'::jsonb, true),
  ('professional', 'Professional', 4900, 'USD', 'month', '{
    "products": 150, "services": 40, "storage_mb": 10000, "staff": 5,
    "ad_credits": 50, "analytics": "advanced", "bookings": true,
    "visibility": "priority", "messages_per_day": 500
  }'::jsonb, true),
  ('business', 'Business', 9900, 'USD', 'month', '{
    "products": 1000, "services": 200, "storage_mb": 50000, "staff": 15,
    "ad_credits": 200, "analytics": "advanced", "bookings": true,
    "visibility": "featured", "messages_per_day": 2000
  }'::jsonb, true),
  ('enterprise', 'Enterprise', 29900, 'USD', 'month', '{
    "products": -1, "services": -1, "storage_mb": 250000, "staff": -1,
    "ad_credits": 1000, "analytics": "enterprise", "bookings": true,
    "visibility": "premium", "messages_per_day": -1, "sla": true, "dedicated_support": true
  }'::jsonb, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = true;

-- Anon can read active plans (public pricing page)
GRANT SELECT ON public.subscription_plans TO anon;
