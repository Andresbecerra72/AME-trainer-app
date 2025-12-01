-- Notification preferences for users
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  notify_on_comment BOOLEAN DEFAULT true,
  notify_on_vote BOOLEAN DEFAULT true,
  notify_on_answer BOOLEAN DEFAULT false,
  notify_on_edit_suggestion BOOLEAN DEFAULT true,
  notify_on_question_approved BOOLEAN DEFAULT true,
  notify_on_report_resolved BOOLEAN DEFAULT true,
  notify_on_badge_earned BOOLEAN DEFAULT true,
  notify_on_streak_milestone BOOLEAN DEFAULT true,
  notify_weekly_digest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question collections/folders
CREATE TABLE IF NOT EXISTS question_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES question_collections(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, question_id)
);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  topic_id UUID REFERENCES topics(id),
  question_count INTEGER NOT NULL DEFAULT 20,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collection_user ON question_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_questions_collection ON collection_questions(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_questions_question ON collection_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_challenge_dates ON weekly_challenges(start_date, end_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge ON challenge_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user ON challenge_attempts(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own collections"
  ON question_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own collections"
  ON question_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON question_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON question_collections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view collection questions for accessible collections"
  ON collection_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM question_collections
      WHERE id = collection_questions.collection_id
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can add questions to their own collections"
  ON collection_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM question_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove questions from their own collections"
  ON collection_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM question_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view active challenges"
  ON weekly_challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON weekly_challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view all challenge attempts"
  ON challenge_attempts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own challenge attempts"
  ON challenge_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
