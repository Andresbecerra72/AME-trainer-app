-- SQL_FINAL_question_exam_signals.sql

-- Add exam_signal_count column to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS exam_signal_count INTEGER NOT NULL DEFAULT 0;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS questions_exam_signal_count_idx 
  ON public.questions(exam_signal_count) WHERE exam_signal_count > 0;

-- Create exam signals table
CREATE TABLE IF NOT EXISTS public.question_exam_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_code TEXT NULL,
  seen_month DATE NULL,
  confidence SMALLINT NULL CHECK (confidence BETWEEN 1 AND 5),
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, user_id)
);

CREATE INDEX IF NOT EXISTS question_exam_signals_question_id_idx
  ON public.question_exam_signals(question_id);
CREATE INDEX IF NOT EXISTS question_exam_signals_user_id_idx
  ON public.question_exam_signals(user_id);
CREATE INDEX IF NOT EXISTS question_exam_signals_created_at_idx
  ON public.question_exam_signals(created_at DESC);

ALTER TABLE public.question_exam_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read exam signals" ON public.question_exam_signals;
DROP POLICY IF EXISTS "Users can insert own exam signals" ON public.question_exam_signals;
DROP POLICY IF EXISTS "Users can delete own exam signals" ON public.question_exam_signals;
DROP POLICY IF EXISTS "Admins can manage all exam signals" ON public.question_exam_signals;

CREATE POLICY "Authenticated users can read exam signals"
  ON public.question_exam_signals
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own exam signals"
  ON public.question_exam_signals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam signals"
  ON public.question_exam_signals
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all exam signals"
  ON public.question_exam_signals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- TRIGGERS: Auto-update exam_signal_count
-- ============================================

-- Function: Increment counter when signal is added
CREATE OR REPLACE FUNCTION increment_exam_signal_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.questions
  SET exam_signal_count = exam_signal_count + 1
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Decrement counter when signal is removed
CREATE OR REPLACE FUNCTION decrement_exam_signal_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.questions
  SET exam_signal_count = GREATEST(0, exam_signal_count - 1)
  WHERE id = OLD.question_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_increment_exam_signal_count ON public.question_exam_signals;
DROP TRIGGER IF EXISTS trigger_decrement_exam_signal_count ON public.question_exam_signals;

-- Create triggers
CREATE TRIGGER trigger_increment_exam_signal_count
  AFTER INSERT ON public.question_exam_signals
  FOR EACH ROW
  EXECUTE FUNCTION increment_exam_signal_count();

CREATE TRIGGER trigger_decrement_exam_signal_count
  AFTER DELETE ON public.question_exam_signals
  FOR EACH ROW
  EXECUTE FUNCTION decrement_exam_signal_count();

-- ============================================
-- BACKFILL: Update existing counts (run once)
-- ============================================

-- Backfill exam_signal_count for existing questions
UPDATE public.questions q
SET exam_signal_count = (
  SELECT COUNT(*)
  FROM public.question_exam_signals s
  WHERE s.question_id = q.id
);

-- Verify counts
-- SELECT id, question_text, exam_signal_count 
-- FROM public.questions 
-- WHERE exam_signal_count > 0 
-- ORDER BY exam_signal_count DESC 
-- LIMIT 10;
