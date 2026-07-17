
-- Admin can update any vendor row (verification workflow)
CREATE POLICY vendors_admin_update ON public.vendors
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can view all payments
CREATE POLICY payments_admin_read ON public.payments
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]));

-- Authenticated user can insert their own pending payment record
CREATE POLICY payments_self_insert ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can grant/revoke roles
CREATE POLICY user_roles_admin_write ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]));

-- Admin can write audit log entries
CREATE POLICY audit_admin_insert ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]));
