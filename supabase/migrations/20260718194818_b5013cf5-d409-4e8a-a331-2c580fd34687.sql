
-- 1) Fix search_path on calc_level
CREATE OR REPLACE FUNCTION public.calc_level(_xp integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT GREATEST(1, 1 + FLOOR(SQRT(GREATEST(_xp,0)::numeric / 100))::integer)
$function$;

-- 2) Revoke EXECUTE from anon + authenticated on internal trigger helpers.
--    Triggers still fire because they run as the function owner, not the caller.
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.bump_post_reaction()',
    'public.handle_new_user()',
    'public.bump_follow_counts()',
    'public.sync_profile_premium()',
    'public.apply_xp_event()',
    'public.bump_event_counts()',
    'public.bump_creator_tips_total()',
    'public.bump_listing_photos_count()',
    'public.bump_listing_saves()',
    'public.refresh_seller_rating()',
    'public.bump_listings_count()',
    'public.bump_ad_campaign_counters()',
    'public.bump_challenge_entries()',
    'public.bump_challenge_entry_votes()',
    'public.bump_creator_subscribers()',
    'public.set_updated_at()'
  ]
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
