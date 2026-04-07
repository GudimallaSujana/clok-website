
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Calendar data table (notes, images, colors per date)
CREATE TABLE public.calendar_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT,
  note_color TEXT DEFAULT 'hsl(48, 95%, 76%)',
  image_url TEXT,
  tile_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.calendar_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar data" ON public.calendar_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar data" ON public.calendar_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar data" ON public.calendar_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar data" ON public.calendar_data FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_calendar_data_updated_at BEFORE UPDATE ON public.calendar_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Birthdays table
CREATE TABLE public.birthdays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own birthdays" ON public.birthdays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own birthdays" ON public.birthdays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own birthdays" ON public.birthdays FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own birthdays" ON public.birthdays FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_birthdays_updated_at BEFORE UPDATE ON public.birthdays FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for calendar images
INSERT INTO storage.buckets (id, name, public) VALUES ('calendar-images', 'calendar-images', true);

CREATE POLICY "Users can view all calendar images" ON storage.objects FOR SELECT USING (bucket_id = 'calendar-images');
CREATE POLICY "Users can upload own calendar images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'calendar-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own calendar images" ON storage.objects FOR UPDATE USING (bucket_id = 'calendar-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own calendar images" ON storage.objects FOR DELETE USING (bucket_id = 'calendar-images' AND auth.uid()::text = (storage.foldername(name))[1]);
