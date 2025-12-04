======================================
========== EXTENSIONES ===============
======================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

======================================
========== ENUMS =====================
======================================
create type role_type as enum ('user', 'admin', 'super_admin');
create type announcement_type as enum ('info', 'warning', 'success', 'error');

======================================
========== PROFILES ==================
======================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role role_type default 'user',
  reputation_points int default 0,
  questions_answered int default 0,
  correct_answers int default 0,
  created_at timestamptz default now()
);

======================================
========== TRIGGER: NEW USER =========
======================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, null, 'user');
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

======================================
========== TOPICS ====================
======================================
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz default now()
);

======================================
========== QUESTIONS =================
======================================
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  reviewed_by uuid references profiles(id),
  content text not null,
  answer_options text[] not null,
  correct_answer int not null,
  status text default 'pending',
  difficulty int default 1,
  upvotes int default 0,
  created_at timestamptz default now()
);

======================================
========== COMMENTS ==================
======================================
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  author_id uuid references profiles(id),
  content text,
  created_at timestamptz default now()
);

======================================
========== VOTES =====================
======================================
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  user_id uuid references profiles(id),
  value int not null,
  created_at timestamptz default now(),
  unique(question_id, user_id)
);

======================================
========== REPORTS ===================
======================================
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  user_id uuid references profiles(id),
  report_type text,
  details text,
  created_at timestamptz default now()
);

======================================
========== EXAMS =====================
======================================
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  author_id uuid references profiles(id),
  is_public boolean default true,
  created_at timestamptz default now()
);

======================================
========== EXAM QUESTIONS ============
======================================
create table if not exists exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade
);

======================================
========== EXAM HISTORY ==============
======================================
create table if not exists exam_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  exam_id uuid references exams(id),
  score int,
  created_at timestamptz default now()
);

======================================
========== COLLECTIONS ===============
======================================
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text,
  created_at timestamptz default now()
);

======================================
========== COLLECTION ITEMS ==========
======================================
create table if not exists collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade
);

======================================
========== NOTIFICATIONS =============
======================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

======================================
========== NOTIFICATION PREFERENCES ==
======================================
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  email_enabled boolean default true,
  push_enabled boolean default true
);

======================================
========== ANNOUNCEMENTS =============
======================================
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type announcement_type not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  expires_at timestamptz,
  is_active boolean default true
);

======================================
========== ANNOUNCEMENT VIEWS ========
======================================
create table if not exists announcement_views (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid references announcements(id) on delete cascade,
  user_id uuid references profiles(id),
  viewed_at timestamptz default now(),
  unique(announcement_id, user_id)
);

======================================
========== STUDY STREAKS =============
======================================
create table if not exists study_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  streak_count int default 0,
  updated_at timestamptz default now()
);

======================================
========== DAILY ACTIVITIES ==========
======================================
create table if not exists daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  activity_type text,
  created_at timestamptz default now()
);

======================================
========= WEEKLY CHALLENGES ==========
======================================
create table if not exists weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_start date,
  challenge_type text,
  required_count int,
  reward_badge uuid references badges(id)
);

======================================
========== BADGES ====================
======================================
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  icon text
);

======================================
========== USER BADGES ===============
======================================
create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  badge_id uuid references badges(id),
  awarded_at timestamptz default now()
);

======================================
       FINAL_RLS_POLICIES
======================================

🔹 PROFILES
======================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by all"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Block profile deletion"
ON profiles FOR DELETE
USING (false);

🔹 TOPICS
======================================

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics readable"
ON topics FOR SELECT
USING (true);

CREATE POLICY "Admins manage topics"
ON topics FOR ALL
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin', 'super_admin')
  )
);

🔹 QUESTIONS
======================================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions readable"
ON questions FOR SELECT
USING (true);

CREATE POLICY "Users insert own questions"
ON questions FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users update own questions"
ON questions FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Admins manage all questions"
ON questions FOR ALL
USING (
  exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin','super_admin')
  )
);

🔹 COMMENTS
======================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments readable"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Users create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users update own comments"
ON comments FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users delete own comments"
ON comments FOR DELETE
USING (auth.uid() = author_id);

CREATE POLICY "Admins manage comments"
ON comments FOR ALL
USING (
  exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin','super_admin')
  )
);

🔹 VOTES
======================================

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes readable"
ON votes FOR SELECT
USING (true);

CREATE POLICY "Users manage own votes"
ON votes FOR ALL
USING (auth.uid() = user_id);

🔹 REPORTS
======================================


⚠️ Debes tener la columna user_id (previo mensaje ya te di el script).

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports readable by admins"
ON reports FOR SELECT
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin','super_admin')
  )
);

CREATE POLICY "Users create reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

🔹 EXAMS
======================================

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exams readable"
ON exams FOR SELECT
USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users insert own exams"
ON exams FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users update own exams"
ON exams FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Admins manage exams"
ON exams FOR ALL
USING (
  exists (
    select 1 from profiles 
    where id = auth.uid()
    and role in ('admin','super_admin')
  )
);

🔹 EXAM HISTORY
======================================

ALTER TABLE exam_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their history"
ON exam_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own exam history"
ON exam_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

🔹 COLLECTIONS
======================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own collections"
ON collections FOR ALL
USING (auth.uid() = user_id);

🔹 COLLECTION ITEMS
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own collection items"
ON collection_items FOR ALL
USING (
  exists (
    select 1
    from collections c
    where c.id = collection_id
    and c.user_id = auth.uid()
  )
);

🔹 ANNOUNCEMENTS
======================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements readable"
ON announcements FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins manage announcements"
ON announcements FOR ALL
USING (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('admin','super_admin')
  )
);

🔹 ANNOUNCEMENT VIEWS
======================================

ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their announcement views"
ON announcement_views FOR ALL
USING (auth.uid() = user_id);

🔹 NOTIFICATIONS
======================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

🔹 NOTIFICATION PREFERENCES
======================================
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
ON notification_preferences FOR ALL
USING (auth.uid() = user_id);

🔹 QUESTION VIEWS
======================================
ALTER TABLE question_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own views"
ON question_views FOR ALL
USING (auth.uid() = user_id);

🔹 STUDY STREAKS
======================================
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own streak"
ON study_streaks FOR ALL
USING (auth.uid() = user_id);

🔹 DAILY ACTIVITIES
======================================
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own daily activities"
ON daily_activities FOR ALL
USING (auth.uid() = user_id);

🔹 WEEKLY CHALLENGES
======================================

(📌 Es tabla global — no tiene user_id)

ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weekly challenges readable"
ON weekly_challenges FOR SELECT
USING (true);

CREATE POLICY "Admins manage weekly challenges"
ON weekly_challenges FOR ALL
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin','super_admin')
  )
);

🔹 SYSTEM SETTINGS
======================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage system settings"
ON system_settings FOR ALL
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin','super_admin')
  )
);