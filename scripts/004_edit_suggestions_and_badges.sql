-- Add edit_suggestions table
CREATE TABLE IF NOT EXISTS public.edit_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  suggested_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  original_data JSONB NOT NULL,
  suggested_data JSONB NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Add inconsistent flag to questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_inconsistent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS inconsistent_notes TEXT;

-- Add upvotes and downvotes columns (if not exist from previous schema)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;
ALTER TABLE public.questions DROP COLUMN IF EXISTS votes;

-- Add reviewed_by and reviewed_at if not exists
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_edit_suggestions_question ON public.edit_suggestions(question_id);
CREATE INDEX IF NOT EXISTS idx_edit_suggestions_status ON public.edit_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, criteria, color) VALUES
  ('First Question', 'Submitted your first question', '🎯', 'Submit 1 question', '#F5DD27'),
  ('Question Master', 'Contributed 10 approved questions', '🏆', 'Submit 10 approved questions', '#EB1010'),
  ('Helpful Contributor', 'Received 50 upvotes', '⭐', 'Receive 50 upvotes', '#105DEB'),
  ('Community Leader', 'Reached 1000 reputation points', '👑', 'Reach 1000 reputation', '#EB10B8'),
  ('Expert Reviewer', 'Reviewed 100 questions as admin', '🔍', 'Review 100 questions', '#8510EB')
ON CONFLICT (name) DO NOTHING;
