-- 1) Revoke EXECUTE from anon/authenticated on trigger/internal SECURITY DEFINER functions.
-- Triggers run as table owner, so they still work; direct RPC calls are blocked.
REVOKE EXECUTE ON FUNCTION public.bump_ad_campaign_counters() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_challenge_entries() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_challenge_entry_votes() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_creator_subscribers() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_creator_tips_total() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_event_counts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_listing_photos_count() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_listing_saves() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_listings_count() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.refresh_seller_rating() FROM anon, authenticated, public;

-- Role/membership helpers: used inside RLS policies, must remain callable by signed-in users.
-- Revoke from anon only (they can never satisfy them anyway).
REVOKE EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_club_staff(uuid, uuid) FROM anon, public;

-- 2) Tighten permissive ad_events INSERT policy.
DROP POLICY IF EXISTS "Anyone signed in logs events" ON public.ad_events;
CREATE POLICY "Signed-in users log own ad events"
ON public.ad_events FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());