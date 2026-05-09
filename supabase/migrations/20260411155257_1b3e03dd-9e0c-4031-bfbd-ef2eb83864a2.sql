
-- Create schemes table
CREATE TABLE public.schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_name TEXT NOT NULL,
  category TEXT NOT NULL,
  target_group TEXT NOT NULL,
  income_limit INTEGER,
  min_age INTEGER DEFAULT 0,
  max_age INTEGER DEFAULT 100,
  state TEXT DEFAULT 'All India',
  gender TEXT DEFAULT 'All',
  education_level TEXT,
  occupation TEXT,
  documents_required TEXT[],
  benefits TEXT NOT NULL,
  deadline TEXT,
  official_link TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schemes are publicly readable"
  ON public.schemes FOR SELECT
  USING (true);

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  income INTEGER,
  occupation TEXT,
  education_level TEXT,
  state TEXT,
  district TEXT,
  category TEXT,
  goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create saved_schemes table
CREATE TABLE public.saved_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scheme_id)
);

ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved schemes" ON public.saved_schemes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save schemes" ON public.saved_schemes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave schemes" ON public.saved_schemes FOR DELETE USING (auth.uid() = user_id);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE NOT NULL,
  match_percentage INTEGER NOT NULL DEFAULT 0,
  eligibility_status TEXT NOT NULL DEFAULT 'partial',
  missing_criteria TEXT[],
  explanation TEXT,
  query_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create recommendations" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
