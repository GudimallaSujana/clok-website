
-- Add emoji_reactions column to calendar_data
ALTER TABLE public.calendar_data ADD COLUMN IF NOT EXISTS emoji_reactions text DEFAULT NULL;

-- Create hero_images table for per-month hero images
CREATE TABLE IF NOT EXISTS public.hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_key text NOT NULL,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hero images" ON public.hero_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hero images" ON public.hero_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hero images" ON public.hero_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hero images" ON public.hero_images FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON public.hero_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
