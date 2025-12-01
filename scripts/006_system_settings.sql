-- Create system settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved exams table for bookmarking community exams
CREATE TABLE IF NOT EXISTS public.saved_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.community_exams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exam_id)
);

-- Add default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
  ('ai_duplicate_detection_enabled', '{"enabled": false}', 'Enable AI-powered duplicate question detection'),
  ('duplicate_similarity_threshold', '{"threshold": 0.8}', 'Threshold for marking questions as potential duplicates (0-1)'),
  ('auto_approve_trusted_users', '{"enabled": false, "min_reputation": 100}', 'Auto-approve questions from trusted users'),
  ('notification_settings', '{"email_enabled": true, "push_enabled": false}', 'Global notification settings');

-- Add index
CREATE INDEX IF NOT EXISTS idx_saved_exams_user ON public.saved_exams(user_id);
