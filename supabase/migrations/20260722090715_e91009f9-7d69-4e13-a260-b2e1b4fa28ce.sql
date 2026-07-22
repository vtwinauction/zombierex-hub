
DROP POLICY IF EXISTS "Public may read sos_alerts by token" ON public.sos_alerts;
DROP POLICY IF EXISTS "Public reads sos_pings" ON public.sos_pings;

REVOKE SELECT ON public.sos_alerts FROM anon;
REVOKE SELECT ON public.sos_pings  FROM anon;

CREATE OR REPLACE FUNCTION public.get_sos_by_token(_token text)
RETURNS TABLE (
  id uuid, kind text, status text, message text,
  latitude double precision, longitude double precision,
  accuracy_m double precision, speed_kmh double precision, heading double precision,
  created_at timestamptz, resolved_at timestamptz,
  contacts_snapshot jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, kind, status, message,
         latitude, longitude, accuracy_m, speed_kmh, heading,
         created_at, resolved_at, contacts_snapshot
  FROM public.sos_alerts
  WHERE share_token = _token
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_sos_pings_by_token(_token text, _limit int DEFAULT 500)
RETURNS TABLE (
  id uuid, latitude double precision, longitude double precision,
  speed_kmh double precision, heading double precision,
  accuracy_m double precision, recorded_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.latitude, p.longitude, p.speed_kmh, p.heading, p.accuracy_m, p.recorded_at
  FROM public.sos_pings p
  JOIN public.sos_alerts a ON a.id = p.alert_id
  WHERE a.share_token = _token
  ORDER BY p.recorded_at ASC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 500), 1), 2000)
$$;

REVOKE ALL ON FUNCTION public.get_sos_by_token(text)             FROM public;
REVOKE ALL ON FUNCTION public.get_sos_pings_by_token(text, int)  FROM public;
GRANT EXECUTE ON FUNCTION public.get_sos_by_token(text)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_sos_pings_by_token(text, int)  TO anon, authenticated;

DROP POLICY IF EXISTS "vendors_public_read" ON public.vendors;

CREATE POLICY "vendors_authenticated_read_approved"
ON public.vendors
FOR SELECT
TO authenticated
USING (verification_status = 'approved' OR is_verified = true);

REVOKE SELECT ON public.vendors FROM anon;

DROP VIEW IF EXISTS public.vendors_public;
CREATE VIEW public.vendors_public
WITH (security_invoker = true)
AS
SELECT
  id, slug, business_name, description, business_type,
  logo_url, cover_url, gallery,
  website, socials, operating_hours, service_areas,
  city, region, country,
  lat, lng,
  is_verified, is_premium, premium_until,
  services_showcase, products_showcase,
  followers_count, profile_views_count,
  created_at
FROM public.vendors
WHERE verification_status = 'approved' OR is_verified = true;

GRANT SELECT ON public.vendors_public TO anon, authenticated;
