
DROP VIEW IF EXISTS public.vendors_public;
CREATE VIEW public.vendors_public AS
  SELECT id, slug, business_name, business_type, description, logo_url, cover_url,
         website, phone, email, address_line1, city, region, country, lat, lng,
         socials, operating_hours, service_areas, is_verified, verification_status,
         is_premium, premium_until, gallery, portfolio, services_showcase,
         products_showcase, contact_channels, followers_count, profile_views_count,
         created_at
  FROM public.vendors
  WHERE verification_status = 'approved' OR is_verified = true;

GRANT SELECT ON public.vendors_public TO anon, authenticated;
