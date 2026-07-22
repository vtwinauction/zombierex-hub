REVOKE EXECUTE ON FUNCTION public.is_group_ride_member(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_ride_member(UUID, UUID) TO authenticated, service_role;