
-- ============ GROUP RIDES ============
DROP POLICY IF EXISTS "auth can lookup by code" ON public.group_rides;

CREATE OR REPLACE FUNCTION public.find_group_ride_by_code(_code text)
RETURNS TABLE(id uuid, title text, host_id uuid, status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, title, host_id, status
  FROM public.group_rides
  WHERE join_code = upper(_code) AND status = 'active'
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.find_group_ride_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_group_ride_by_code(text) TO authenticated;

-- ============ VENDORS ============
-- Drop the broad authenticated read; force public consumption through vendors_public view.
DROP POLICY IF EXISTS "vendors_authenticated_read_approved" ON public.vendors;

-- ============ EVENTS (dedupe overly-broad read) ============
DROP POLICY IF EXISTS "events_read" ON public.events;

-- Helper: can current user view a given event?
CREATE OR REPLACE FUNCTION public.can_view_event(_event_id uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = _event_id
      AND (
        e.visibility IN ('public','unlisted')
        OR e.host_id = _user
        OR EXISTS (SELECT 1 FROM public.event_rsvps r WHERE r.event_id = e.id AND r.user_id = _user)
        OR EXISTS (SELECT 1 FROM public.event_invites i WHERE i.event_id = e.id AND i.invitee_id = _user)
      )
  )
$$;

REVOKE ALL ON FUNCTION public.can_view_event(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_event(uuid, uuid) TO authenticated;

-- ============ EVENT RSVPS ============
DROP POLICY IF EXISTS "rsvp_read" ON public.event_rsvps;
CREATE POLICY "rsvp_read_scoped" ON public.event_rsvps
  FOR SELECT TO authenticated
  USING (public.can_view_event(event_id, auth.uid()));

-- ============ EVENT PHOTOS ============
DROP POLICY IF EXISTS "event photos readable" ON public.event_photos;
CREATE POLICY "event photos readable scoped" ON public.event_photos
  FOR SELECT TO authenticated
  USING (public.can_view_event(event_id, auth.uid()));

-- ============ EVENT COMMENTS ============
DROP POLICY IF EXISTS "event comments readable" ON public.event_comments;
CREATE POLICY "event comments readable scoped" ON public.event_comments
  FOR SELECT TO authenticated
  USING (public.can_view_event(event_id, auth.uid()));

-- ============ EVENT CHECKINS ============
DROP POLICY IF EXISTS "checkins readable" ON public.event_checkins;
CREATE POLICY "checkins readable scoped" ON public.event_checkins
  FOR SELECT TO authenticated
  USING (public.can_view_event(event_id, auth.uid()));

-- ============ EVENT ANNOUNCEMENTS ============
DROP POLICY IF EXISTS "announcements readable" ON public.event_announcements;
CREATE POLICY "announcements readable scoped" ON public.event_announcements
  FOR SELECT TO authenticated
  USING (public.can_view_event(event_id, auth.uid()));
