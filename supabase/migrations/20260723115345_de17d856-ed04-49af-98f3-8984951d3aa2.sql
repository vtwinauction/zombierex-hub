
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_posts_hidden ON public.posts (is_hidden) WHERE is_hidden = true;
