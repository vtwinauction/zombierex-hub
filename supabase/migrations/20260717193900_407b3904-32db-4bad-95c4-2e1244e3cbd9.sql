
DO $$ BEGIN
  CREATE POLICY "Anyone reads active campaigns" ON public.ad_campaigns
    FOR SELECT USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT (
  id, owner_id, vendor_id, name, objective, status, placements, currency, created_at
) ON public.ad_campaigns TO anon;

GRANT SELECT ON public.ad_creatives TO anon;
