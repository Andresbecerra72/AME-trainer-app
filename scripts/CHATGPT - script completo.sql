-- =====================================================================
--  FINAL_SCHEMA.SQL
--  Consolidated, ordered, modern schema for AME Exam Trainer Platform
-- =====================================================================

---------------------------
-- 0. EXTENSIONS
---------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

---------------------------
-- 1. ENUMS
---------------------------
create type user_role as enum ('user', 'admin', 'super_admin');
create type question_status as enum ('pending', 'approved', 'rejected');

---------------------------
-- 2. USER PROFILES (extends auth.users)
---------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role user_role not null default 'user',
  reputation int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_role on profiles(role);

---------------------------
-- 3. TOPICS
---------------------------
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

---------------------------
-- 4. QUESTIONS
---------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text check (correct_option in ('a','b','c','d')),
  explanation text,
  source text,
  difficulty int default 1,
  is_doubtful boolean default false,
  status question_status default 'approved',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_questions_topic on questions(topic_id);
create index if not exists idx_questions_user on questions(user_id);

---------------------------
-- 5. QUESTION ATTEMPTS
---------------------------
create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  selected_option text,
  is_correct boolean,
  attempted_at timestamptz default now()
);

create unique index if not exists uq_attempt_one_per_user
on question_attempts(user_id, question_id);

---------------------------
-- 6. QUESTION VIEWS
---------------------------
create table if not exists public.question_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  question_id uuid references public.questions(id) on delete cascade,
  viewed_at timestamptz default now()
);

---------------------------
-- 7. COMMENTS
---------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

---------------------------
-- 8. VOTES
---------------------------
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  value int check (value in (-1,1)),
  created_at timestamptz default now(),
  unique(question_id, user_id)
);

---------------------------
-- 9. REPORTS
---------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);

---------------------------
-- 10. EXAMS (Community Exams)
---------------------------
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  author_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  is_public boolean default true
);

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade
);

create table if not exists public.exam_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  exam_id uuid references public.exams(id),
  score int,
  created_at timestamptz default now()
);

---------------------------
-- 11. BADGES & USER BADGES
---------------------------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  icon text,
  created_at timestamptz default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  badge_id uuid references public.badges(id),
  awarded_at timestamptz default now(),
  unique(user_id, badge_id)
);

---------------------------
-- 12. NOTIFICATIONS
---------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

---------------------------
-- 13. COLLECTIONS & BOOKMARKS
---------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  name text,
  created_at timestamptz default now()
);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade
);

---------------------------
-- 14. ANNOUNCEMENTS
---------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text check (type in ('info','warning','success','error')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  expires_at timestamptz,
  is_active boolean default true
);

create table if not exists public.announcement_views (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid references public.announcements(id) on delete cascade,
  user_id uuid references public.profiles(id),
  viewed_at timestamptz default now(),
  unique(announcement_id, user_id)
);

---------------------------
-- 15. TRIGGER: AUTO-CREATE PROFILE FROM AUTH
---------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_profile cascade;

create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_profile();

---------------------------
-- 16. ROW LEVEL SECURITY (RLS)
---------------------------

-- Enable RLS
alter table profiles enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;
alter table question_attempts enable row level security;
alter table question_views enable row level security;
alter table exams enable row level security;
alter table exam_history enable row level security;
alter table announcements enable row level security;
alter table announcement_views enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table notifications enable row level security;

alter table badges enable row level security;
alter table bookmarks enable row level security;
alter table daily_activities enable row level security;
alter table exam_questions enable row level security;
alter table question_of_day enable row level security;
alter table saved_exams enable row level security;
alter table study_streaks enable row level security;
alter table system_settings enable row level security;
alter table user_badges enable row level security;

-- PROFILES
create policy "Public profiles readable"
on profiles for select using (true);

create policy "Users can update own profile"
on profiles for update using (auth.uid() = id);

-- TOPICS
create policy "Topics readable"
on topics for select using (true);

-- QUESTIONS
create policy "Questions readable"
on questions for select using (true);

create policy "Users insert own questions"
on questions for insert with check (auth.uid() = user_id);

create policy "Users update own questions"
on questions for update using (auth.uid() = user_id);

create policy "Admins manage all questions"
on questions for all using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and role in ('admin','super_admin')
  )
);

-- QUESTION ATTEMPTS
create policy "Users manage own attempts"
on question_attempts for all using (auth.uid() = user_id);

-- QUESTION VIEWS
create policy "Users record own views"
on question_views for insert with check (auth.uid() = user_id);

-- COMMENTS
create policy "Comments readable"
on comments for select using (true);

create policy "Users insert own comments"
on comments for insert with check (auth.uid() = user_id);

-- VOTES
create policy "Users vote own"
on votes for insert with check (auth.uid() = user_id);

-- REPORTS
create policy "Users report questions"
on reports for insert with check (auth.uid() = user_id);

-- EXAMS
create policy "Exams readable"
on exams for select using (true);

create policy "Users manage own exams"
on exams for all using (auth.uid() = author_id);

-- COLLECTIONS
create policy "Users manage own collections"
on collections for all using (auth.uid() = user_id);

create policy "Users manage own collection items"
on collection_items for all using (
  exists (
    select 1 from collections
    where collections.id = collection_items.collection_id
    and collections.user_id = auth.uid()
  )
);

-- ANNOUNCEMENTS
create policy "Announcements readable"
on announcements for select using (is_active = true);

create policy "Admins manage announcements"
on announcements for all using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and role in ('admin','super_admin')
  )
);

---------------------------
-- 17. SEED TOPICS
---------------------------
insert into topics (title, slug, description) values
('Airframe', 'airframe', 'Airframe structures and systems'),
('Powerplant', 'powerplant', 'Engine theory and systems'),
('Avionics', 'avionics', 'Aircraft electronics and instrumentation'),
('Regulations', 'regulations', 'Aviation law, safety, and certification'),
('Human Factors', 'human-factors', 'HF, CRM, safety'),
('General Knowledge', 'general', 'AME general engineering principles')
on conflict (slug) do nothing;

-- DONE.
