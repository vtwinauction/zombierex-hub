
DO $$ BEGIN
  CREATE POLICY vendors_public_read ON public.vendors FOR SELECT
    USING (verification_status = 'approved' OR is_verified = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT (
  id, slug, business_name, business_type, description, logo_url, cover_url,
  website, phone, email, address_line1, city, region, country, lat, lng,
  socials, operating_hours, service_areas, is_verified, verification_status,
  is_premium, premium_until, gallery, portfolio, services_showcase,
  products_showcase, contact_channels, followers_count, profile_views_count,
  created_at
) ON public.vendors TO anon;
