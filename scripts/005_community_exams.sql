-- Create community_exams table
CREATE TABLE IF NOT EXISTS public.community_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_ids UUID[] NOT NULL,
  question_count INTEGER NOT NULL,
  time_limit INTEGER, -- in minutes
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  taken_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_ratings table
CREATE TABLE IF NOT EXISTS public.exam_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES public.community_exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, user_id)
);

-- Create exam_attempts table (extends existing exam_history)
ALTER TABLE public.exam_history ADD COLUMN IF NOT EXISTS community_exam_id UUID REFERENCES public.community_exams(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_exams_created_by ON public.community_exams(created_by);
CREATE INDEX IF NOT EXISTS idx_community_exams_is_public ON public.community_exams(is_public);
CREATE INDEX IF NOT EXISTS idx_community_exams_is_featured ON public.community_exams(is_featured);
CREATE INDEX IF NOT EXISTS idx_exam_ratings_exam ON public.exam_ratings(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_community_exam ON public.exam_history(community_exam_id);

-- Enable RLS
ALTER TABLE public.community_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_exams
CREATE POLICY "Anyone can view public exams" ON public.community_exams
  FOR SELECT USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create exams" ON public.community_exams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exams" ON public.community_exams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own exams" ON public.community_exams
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for exam_ratings
CREATE POLICY "Anyone can view ratings" ON public.exam_ratings
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can rate exams" ON public.exam_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.exam_ratings
  FOR UPDATE USING (auth.uid() = user_id);
