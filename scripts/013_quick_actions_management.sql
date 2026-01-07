-- Quick Actions Management System
-- Permite al super_admin gestionar qué Quick Actions ve cada role

-- Table: quick_actions
-- Stores all available quick actions in the system
CREATE TABLE IF NOT EXISTS quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL, -- Icon name from lucide-react
  color VARCHAR(50) NOT NULL, -- Tailwind color class
  bg_color VARCHAR(100) NOT NULL, -- Tailwind background class
  path VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: role_quick_actions
-- Controls which quick actions are visible for each role
CREATE TABLE IF NOT EXISTS role_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  quick_action_id UUID NOT NULL REFERENCES quick_actions(id) ON DELETE CASCADE,
  is_hidden BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, quick_action_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_actions_active ON quick_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_quick_actions_order ON quick_actions(display_order);
CREATE INDEX IF NOT EXISTS idx_role_quick_actions_role ON role_quick_actions(role);
CREATE INDEX IF NOT EXISTS idx_role_quick_actions_hidden ON role_quick_actions(is_hidden);

-- Seed data: Insert all quick actions
INSERT INTO quick_actions (title, description, icon, color, bg_color, path, display_order) VALUES
('Add Questions', 'Expand your question bank', 'PlusCircle', 'text-green-600', 'bg-green-50 dark:bg-green-950/20', '/protected/add-question', 1),
('Study Topics', 'Browse and study by topic', 'BookOpen', 'text-blue-600', 'bg-blue-50 dark:bg-blue-950/20', '/protected/topics', 2),
('Community', 'Learn with others', 'Users', 'text-green-600', 'bg-green-50 dark:bg-green-950/20', '/protected/community', 3),
('Practice Exam', 'Take practice exams', 'Brain', 'text-purple-600', 'bg-purple-50 dark:bg-purple-950/20', '/protected/exam/setup', 4),
('Progress Analytics', 'Track your performance', 'TrendingUp', 'text-blue-600', 'bg-blue-50 dark:bg-blue-950/20', '/protected/analytics', 5),
('Community Exams', 'User-created exams', 'GraduationCap', 'text-orange-600', 'bg-orange-50 dark:bg-orange-950/20', '/protected/exams', 6),
('Daily Question', 'Today''s challenge', 'Sparkles', 'text-pink-600', 'bg-pink-50 dark:bg-pink-950/20', '/protected/question-of-day', 7),
('Weekly Challenge', 'Compete with others', 'Target', 'text-red-600', 'bg-red-50 dark:bg-red-950/20', '/protected/challenges', 8),
('My Collections', 'Organized questions', 'Folder', 'text-teal-600', 'bg-teal-50 dark:bg-teal-950/20', '/protected/collections', 9),
('Exam History', 'View past results', 'History', 'text-indigo-600', 'bg-indigo-50 dark:bg-indigo-950/20', '/protected/exam-history', 10),
('Leaderboard', 'Top contributors', 'Trophy', 'text-amber-600', 'bg-amber-50 dark:bg-amber-950/20', '/protected/leaderboard', 11),
('Recommendations', 'Personalized for you', 'Sparkles', 'text-violet-600', 'bg-violet-50 dark:bg-violet-950/20', '/protected/recommendations', 12),
('Activity Feed', 'Platform updates', 'Activity', 'text-cyan-600', 'bg-cyan-50 dark:bg-cyan-950/20', '/protected/activity-feed', 13)
ON CONFLICT DO NOTHING;

-- Seed data: Default visibility for all roles (all actions visible by default)
INSERT INTO role_quick_actions (role, quick_action_id, is_hidden, display_order)
SELECT 'user'::user_role, id, false, display_order FROM quick_actions
ON CONFLICT DO NOTHING;

INSERT INTO role_quick_actions (role, quick_action_id, is_hidden, display_order)
SELECT 'admin'::user_role, id, false, display_order FROM quick_actions
ON CONFLICT DO NOTHING;

INSERT INTO role_quick_actions (role, quick_action_id, is_hidden, display_order)
SELECT 'super_admin'::user_role, id, false, display_order FROM quick_actions
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quick_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS quick_actions_updated_at ON quick_actions;
CREATE TRIGGER quick_actions_updated_at
  BEFORE UPDATE ON quick_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_actions_updated_at();

DROP TRIGGER IF EXISTS role_quick_actions_updated_at ON role_quick_actions;
CREATE TRIGGER role_quick_actions_updated_at
  BEFORE UPDATE ON role_quick_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_actions_updated_at();

-- RLS Policies
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_quick_actions ENABLE ROW LEVEL SECURITY;

-- Quick Actions: Everyone can read active actions
CREATE POLICY "Anyone can view active quick actions"
  ON quick_actions FOR SELECT
  USING (is_active = true);

-- Quick Actions: Only super_admin can modify
CREATE POLICY "Super admin can manage quick actions"
  ON quick_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Role Quick Actions: Users can read their role's configuration
CREATE POLICY "Users can view their role quick actions"
  ON role_quick_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = role_quick_actions.role
    )
  );

-- Role Quick Actions: Only super_admin can modify
CREATE POLICY "Super admin can manage role quick actions"
  ON role_quick_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Comments
COMMENT ON TABLE quick_actions IS 'Stores all available quick action cards in the dashboard';
COMMENT ON TABLE role_quick_actions IS 'Controls visibility and order of quick actions per role';
COMMENT ON COLUMN role_quick_actions.is_hidden IS 'When true, the action is hidden for this role';
COMMENT ON COLUMN role_quick_actions.display_order IS 'Order in which actions appear for this role';
