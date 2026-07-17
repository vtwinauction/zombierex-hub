
-- Restrict vendors table SELECT to owner + admins; expose safe columns publicly via a view.
DROP POLICY IF EXISTS vendors_read ON public.vendors;

CREATE POLICY vendors_owner_read ON public.vendors
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Public-facing safe view (no email/phone/tax/license/legal/address details).
CREATE OR REPLACE VIEW public.vendors_public
WITH (security_invoker = true) AS
SELECT
  id, slug, business_name, business_type, description,
  website, city, region, country, lat, lng,
  socials, operating_hours, service_areas,
  is_verified, verification_status, created_at
FROM public.vendors
WHERE verification_status = 'approved' OR is_verified = true;

GRANT SELECT ON public.vendors_public TO anon, authenticated;
