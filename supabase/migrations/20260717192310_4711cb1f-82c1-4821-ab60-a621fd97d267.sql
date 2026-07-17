
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='marketplace_read') THEN
    CREATE POLICY marketplace_read ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'marketplace');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='marketplace_owner_write') THEN
    CREATE POLICY marketplace_owner_write ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'marketplace' AND owner = auth.uid())
      WITH CHECK (bucket_id = 'marketplace' AND owner = auth.uid());
  END IF;
END $$;
