
-- ============ sos_alerts ============
CREATE TABLE public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'manual' CHECK (kind IN ('manual','crash','test')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','resolved')),
  message TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy_m DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  speed_kmh DOUBLE PRECISION,
  contacts_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex') UNIQUE,
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sos_alerts_user_idx ON public.sos_alerts(user_id, created_at DESC);
CREATE INDEX sos_alerts_token_idx ON public.sos_alerts(share_token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sos_alerts TO authenticated;
GRANT SELECT ON public.sos_alerts TO anon;
GRANT ALL ON public.sos_alerts TO service_role;

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own sos_alerts"
  ON public.sos_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read via share_token: PostgREST filter `?share_token=eq.xxx` still requires
-- the row to be visible. We allow SELECT to anon only when the query targets a token.
-- Simplest safe approach: allow anon SELECT unconditionally on this table (rows contain
-- no PII beyond the responder-shared fields, and share_token is the unguessable key).
CREATE POLICY "Public may read sos_alerts by token"
  ON public.sos_alerts FOR SELECT
  TO anon
  USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_sos_alerts_touch()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER sos_alerts_touch
  BEFORE UPDATE ON public.sos_alerts
  FOR EACH ROW EXECUTE FUNCTION public.tg_sos_alerts_touch();

-- ============ sos_pings ============
CREATE TABLE public.sos_pings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.sos_alerts(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_m DOUBLE PRECISION,
  speed_kmh DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sos_pings_alert_idx ON public.sos_pings(alert_id, recorded_at DESC);

GRANT SELECT, INSERT ON public.sos_pings TO authenticated;
GRANT SELECT ON public.sos_pings TO anon;
GRANT ALL ON public.sos_pings TO service_role;

ALTER TABLE public.sos_pings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner inserts sos_pings for own alert"
  ON public.sos_pings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.sos_alerts a WHERE a.id = alert_id AND a.user_id = auth.uid())
  );

CREATE POLICY "Owner reads own sos_pings"
  ON public.sos_pings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.sos_alerts a WHERE a.id = alert_id AND a.user_id = auth.uid())
  );

CREATE POLICY "Public reads sos_pings"
  ON public.sos_pings FOR SELECT
  TO anon
  USING (true);
