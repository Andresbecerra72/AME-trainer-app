-- Add study streaks tracking
CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add question of the day
CREATE TABLE IF NOT EXISTS public.question_of_day (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add daily activity tracking
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  exams_taken INTEGER DEFAULT 0,
  questions_contributed INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_streaks_user ON public.study_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_question_of_day_date ON public.question_of_day(date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON public.daily_activities(user_id, activity_date);
