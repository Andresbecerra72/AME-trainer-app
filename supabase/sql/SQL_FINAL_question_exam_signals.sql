-- SQL_FINAL_question_exam_signals.sql

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
