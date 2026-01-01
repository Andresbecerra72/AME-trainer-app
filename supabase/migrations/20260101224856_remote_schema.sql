drop extension if exists "pg_net";

create type "public"."notification_type" as enum ('upvote', 'comment', 'answer', 'mention', 'badge', 'moderation', 'question_approved', 'question_rejected');

create type "public"."question_difficulty" as enum ('easy', 'medium', 'hard');

create type "public"."question_status" as enum ('pending', 'approved', 'rejected', 'flagged');

create type "public"."report_status" as enum ('pending', 'reviewed', 'resolved', 'dismissed');

create type "public"."user_role" as enum ('user', 'admin', 'super_admin');


  create table "public"."announcement_views" (
    "id" uuid not null default gen_random_uuid(),
    "announcement_id" uuid,
    "user_id" uuid,
    "viewed_at" timestamp with time zone default now()
      );


alter table "public"."announcement_views" enable row level security;


  create table "public"."announcements" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "message" text not null,
    "type" text not null,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone,
    "is_active" boolean default true,
    "created_by" uuid
      );


alter table "public"."announcements" enable row level security;


  create table "public"."badges" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "icon" text,
    "requirement" integer not null,
    "created_at" timestamp with time zone default now(),
    "color" text,
    "criteria" text
      );


alter table "public"."badges" enable row level security;


  create table "public"."bookmarks" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "question_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."bookmarks" enable row level security;


  create table "public"."challenge_attempts" (
    "id" uuid not null default gen_random_uuid(),
    "challenge_id" uuid not null,
    "user_id" uuid not null,
    "score" integer not null,
    "total_questions" integer not null,
    "time_taken" integer not null,
    "completed_at" timestamp with time zone default now()
      );


alter table "public"."challenge_attempts" enable row level security;


  create table "public"."collection_items" (
    "id" uuid not null default gen_random_uuid(),
    "collection_id" uuid,
    "question_id" uuid
      );


alter table "public"."collection_items" enable row level security;


  create table "public"."collection_questions" (
    "id" uuid not null default gen_random_uuid(),
    "collection_id" uuid not null,
    "question_id" uuid not null,
    "added_at" timestamp with time zone default now()
      );


alter table "public"."collection_questions" enable row level security;


  create table "public"."collections" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."collections" enable row level security;


  create table "public"."comments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "question_id" uuid,
    "author_id" uuid,
    "content" text not null,
    "upvotes" integer default 0,
    "is_edited" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."comments" enable row level security;


  create table "public"."community_exams" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "created_by" uuid,
    "topic_ids" uuid[] not null,
    "question_count" integer not null,
    "time_limit" integer,
    "difficulty" text,
    "is_public" boolean default true,
    "is_featured" boolean default false,
    "rating_average" numeric(3,2) default 0,
    "rating_count" integer default 0,
    "taken_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."community_exams" enable row level security;


  create table "public"."daily_activities" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "activity_date" date not null,
    "questions_answered" integer default 0,
    "exams_taken" integer default 0,
    "questions_contributed" integer default 0,
    "comments_made" integer default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."daily_activities" enable row level security;


  create table "public"."edit_suggestions" (
    "id" uuid not null default gen_random_uuid(),
    "question_id" uuid not null,
    "user_id" uuid not null,
    "proposed_question_text" text,
    "proposed_answers" jsonb,
    "proposed_correct_index" text,
    "reason" text,
    "status" text not null default 'pending'::text,
    "reviewed_by" uuid,
    "reviewer_notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."edit_suggestions" enable row level security;


  create table "public"."exam_history" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "topic_ids" uuid[],
    "question_count" integer not null,
    "correct_answers" integer not null,
    "incorrect_answers" integer not null,
    "score_percentage" numeric(5,2) not null,
    "time_taken" integer,
    "completed_at" timestamp with time zone default now(),
    "community_exam_id" uuid
      );


alter table "public"."exam_history" enable row level security;


  create table "public"."exam_questions" (
    "id" uuid not null default gen_random_uuid(),
    "exam_id" uuid,
    "question_id" uuid
      );


alter table "public"."exam_questions" enable row level security;


  create table "public"."exam_ratings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "exam_id" uuid,
    "user_id" uuid,
    "rating" integer not null,
    "review" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."exam_ratings" enable row level security;


  create table "public"."exams" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "author_id" uuid,
    "is_public" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."exams" enable row level security;


  create table "public"."notification_preferences" (
    "user_id" uuid not null,
    "email_notifications" boolean default true,
    "push_notifications" boolean default true,
    "notify_on_comment" boolean default true,
    "notify_on_vote" boolean default true,
    "notify_on_answer" boolean default false,
    "notify_on_edit_suggestion" boolean default true,
    "notify_on_question_approved" boolean default true,
    "notify_on_report_resolved" boolean default true,
    "notify_on_badge_earned" boolean default true,
    "notify_on_streak_milestone" boolean default true,
    "notify_weekly_digest" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."notification_preferences" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "type" public.notification_type not null,
    "title" text not null,
    "message" text not null,
    "link" text,
    "is_read" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "display_name" text,
    "avatar_url" text,
    "bio" text,
    "role" public.user_role default 'user'::public.user_role,
    "reputation" integer default 0,
    "questions_contributed" integer default 0,
    "answers_contributed" integer default 0,
    "upvotes_received" integer default 0,
    "is_verified" boolean default false,
    "is_banned" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "full_name" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."question_attempts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "question_id" uuid,
    "selected_option" text,
    "is_correct" boolean,
    "attempted_at" timestamp with time zone default now()
      );


alter table "public"."question_attempts" enable row level security;


  create table "public"."question_collections" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "description" text,
    "is_public" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."question_collections" enable row level security;


  create table "public"."question_imports" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "file_path" text not null,
    "file_name" text,
    "file_mime" text,
    "status" text not null default 'pending'::text,
    "raw_text" text,
    "result" jsonb,
    "stats" jsonb,
    "error" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."question_imports" enable row level security;


  create table "public"."question_of_day" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "question_id" uuid,
    "date" date not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."question_of_day" enable row level security;


  create table "public"."question_views" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "question_id" uuid,
    "viewed_at" timestamp with time zone default now()
      );


alter table "public"."question_views" enable row level security;


  create table "public"."questions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "topic_id" uuid,
    "author_id" uuid,
    "question_text" text not null,
    "option_a" text not null,
    "option_b" text not null,
    "option_c" text not null,
    "option_d" text not null,
    "correct_answer" character(1) not null,
    "explanation" text,
    "difficulty" public.question_difficulty default 'medium'::public.question_difficulty,
    "status" public.question_status default 'pending'::public.question_status,
    "upvotes" integer default 0,
    "downvotes" integer default 0,
    "comment_count" integer default 0,
    "report_count" integer default 0,
    "is_featured" boolean default false,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "rejection_reason" text
      );


alter table "public"."questions" enable row level security;


  create table "public"."reports" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "reporter_id" uuid,
    "question_id" uuid,
    "comment_id" uuid,
    "reason" text not null,
    "description" text,
    "status" public.report_status default 'pending'::public.report_status,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "resolution_notes" text,
    "created_at" timestamp with time zone default now(),
    "user_id" uuid
      );


alter table "public"."reports" enable row level security;


  create table "public"."saved_exams" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "exam_id" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."saved_exams" enable row level security;


  create table "public"."study_streaks" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "current_streak" integer default 0,
    "longest_streak" integer default 0,
    "last_activity_date" date default CURRENT_DATE,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."study_streaks" enable row level security;


  create table "public"."system_settings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "setting_key" text not null,
    "setting_value" jsonb not null,
    "description" text,
    "updated_by" uuid,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."system_settings" enable row level security;


  create table "public"."topics" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "icon" text,
    "question_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "code" text
      );


alter table "public"."topics" enable row level security;


  create table "public"."user_badges" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "badge_id" uuid,
    "earned_at" timestamp with time zone default now()
      );


alter table "public"."user_badges" enable row level security;


  create table "public"."votes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "question_id" uuid,
    "comment_id" uuid,
    "vote_type" integer not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."votes" enable row level security;


  create table "public"."weekly_challenges" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "topic_id" uuid,
    "question_count" integer not null default 20,
    "start_date" date not null,
    "end_date" date not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."weekly_challenges" enable row level security;

CREATE UNIQUE INDEX announcement_views_announcement_id_user_id_key ON public.announcement_views USING btree (announcement_id, user_id);

CREATE UNIQUE INDEX announcement_views_pkey ON public.announcement_views USING btree (id);

CREATE UNIQUE INDEX announcements_pkey ON public.announcements USING btree (id);

CREATE UNIQUE INDEX badges_name_key ON public.badges USING btree (name);

CREATE UNIQUE INDEX badges_pkey ON public.badges USING btree (id);

CREATE UNIQUE INDEX bookmarks_pkey ON public.bookmarks USING btree (id);

CREATE UNIQUE INDEX bookmarks_user_id_question_id_key ON public.bookmarks USING btree (user_id, question_id);

CREATE UNIQUE INDEX challenge_attempts_challenge_id_user_id_key ON public.challenge_attempts USING btree (challenge_id, user_id);

CREATE UNIQUE INDEX challenge_attempts_pkey ON public.challenge_attempts USING btree (id);

CREATE UNIQUE INDEX collection_items_pkey ON public.collection_items USING btree (id);

CREATE UNIQUE INDEX collection_questions_collection_id_question_id_key ON public.collection_questions USING btree (collection_id, question_id);

CREATE UNIQUE INDEX collection_questions_pkey ON public.collection_questions USING btree (id);

CREATE UNIQUE INDEX collections_pkey ON public.collections USING btree (id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX community_exams_pkey ON public.community_exams USING btree (id);

CREATE UNIQUE INDEX daily_activities_pkey ON public.daily_activities USING btree (id);

CREATE UNIQUE INDEX daily_activities_user_id_activity_date_key ON public.daily_activities USING btree (user_id, activity_date);

CREATE UNIQUE INDEX edit_suggestions_pkey ON public.edit_suggestions USING btree (id);

CREATE UNIQUE INDEX exam_history_pkey ON public.exam_history USING btree (id);

CREATE UNIQUE INDEX exam_questions_pkey ON public.exam_questions USING btree (id);

CREATE UNIQUE INDEX exam_ratings_exam_id_user_id_key ON public.exam_ratings USING btree (exam_id, user_id);

CREATE UNIQUE INDEX exam_ratings_pkey ON public.exam_ratings USING btree (id);

CREATE UNIQUE INDEX exams_pkey ON public.exams USING btree (id);

CREATE INDEX idx_announcement_views_user ON public.announcement_views USING btree (user_id);

CREATE INDEX idx_announcements_active ON public.announcements USING btree (is_active, expires_at);

CREATE INDEX idx_challenge_attempts_challenge ON public.challenge_attempts USING btree (challenge_id);

CREATE INDEX idx_challenge_attempts_user ON public.challenge_attempts USING btree (user_id);

CREATE INDEX idx_challenge_dates ON public.weekly_challenges USING btree (start_date, end_date) WHERE (is_active = true);

CREATE INDEX idx_collection_questions_collection ON public.collection_questions USING btree (collection_id);

CREATE INDEX idx_collection_questions_question ON public.collection_questions USING btree (question_id);

CREATE INDEX idx_collection_user ON public.question_collections USING btree (user_id);

CREATE INDEX idx_comments_author ON public.comments USING btree (author_id);

CREATE INDEX idx_comments_question ON public.comments USING btree (question_id);

CREATE INDEX idx_community_exams_created_by ON public.community_exams USING btree (created_by);

CREATE INDEX idx_community_exams_is_featured ON public.community_exams USING btree (is_featured);

CREATE INDEX idx_community_exams_is_public ON public.community_exams USING btree (is_public);

CREATE INDEX idx_daily_activities_user_date ON public.daily_activities USING btree (user_id, activity_date);

CREATE INDEX idx_exam_history_community_exam ON public.exam_history USING btree (community_exam_id);

CREATE INDEX idx_exam_history_user ON public.exam_history USING btree (user_id);

CREATE INDEX idx_exam_ratings_exam ON public.exam_ratings USING btree (exam_id);

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);

CREATE INDEX idx_question_imports_status ON public.question_imports USING btree (status);

CREATE INDEX idx_question_imports_user ON public.question_imports USING btree (user_id);

CREATE INDEX idx_question_of_day_date ON public.question_of_day USING btree (date);

CREATE INDEX idx_questions_author ON public.questions USING btree (author_id);

CREATE INDEX idx_questions_status ON public.questions USING btree (status);

CREATE INDEX idx_questions_topic ON public.questions USING btree (topic_id);

CREATE INDEX idx_reports_status ON public.reports USING btree (status);

CREATE INDEX idx_saved_exams_user ON public.saved_exams USING btree (user_id);

CREATE INDEX idx_study_streaks_user ON public.study_streaks USING btree (user_id);

CREATE INDEX idx_votes_question ON public.votes USING btree (question_id);

CREATE INDEX idx_votes_user ON public.votes USING btree (user_id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (user_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX question_attempts_pkey ON public.question_attempts USING btree (id);

CREATE UNIQUE INDEX question_attempts_user_id_question_id_key ON public.question_attempts USING btree (user_id, question_id);

CREATE UNIQUE INDEX question_collections_pkey ON public.question_collections USING btree (id);

CREATE UNIQUE INDEX question_imports_pkey ON public.question_imports USING btree (id);

CREATE UNIQUE INDEX question_of_day_date_key ON public.question_of_day USING btree (date);

CREATE UNIQUE INDEX question_of_day_pkey ON public.question_of_day USING btree (id);

CREATE UNIQUE INDEX question_views_pkey ON public.question_views USING btree (id);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX saved_exams_pkey ON public.saved_exams USING btree (id);

CREATE UNIQUE INDEX saved_exams_user_id_exam_id_key ON public.saved_exams USING btree (user_id, exam_id);

CREATE UNIQUE INDEX study_streaks_pkey ON public.study_streaks USING btree (id);

CREATE UNIQUE INDEX study_streaks_user_id_key ON public.study_streaks USING btree (user_id);

CREATE UNIQUE INDEX system_settings_pkey ON public.system_settings USING btree (id);

CREATE UNIQUE INDEX system_settings_setting_key_key ON public.system_settings USING btree (setting_key);

CREATE UNIQUE INDEX topics_code_unique ON public.topics USING btree (code);

CREATE UNIQUE INDEX topics_pkey ON public.topics USING btree (id);

CREATE UNIQUE INDEX user_badges_pkey ON public.user_badges USING btree (id);

CREATE UNIQUE INDEX user_badges_user_id_badge_id_key ON public.user_badges USING btree (user_id, badge_id);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id);

CREATE UNIQUE INDEX votes_user_id_comment_id_key ON public.votes USING btree (user_id, comment_id);

CREATE UNIQUE INDEX votes_user_id_question_id_key ON public.votes USING btree (user_id, question_id);

CREATE UNIQUE INDEX weekly_challenges_pkey ON public.weekly_challenges USING btree (id);

alter table "public"."announcement_views" add constraint "announcement_views_pkey" PRIMARY KEY using index "announcement_views_pkey";

alter table "public"."announcements" add constraint "announcements_pkey" PRIMARY KEY using index "announcements_pkey";

alter table "public"."badges" add constraint "badges_pkey" PRIMARY KEY using index "badges_pkey";

alter table "public"."bookmarks" add constraint "bookmarks_pkey" PRIMARY KEY using index "bookmarks_pkey";

alter table "public"."challenge_attempts" add constraint "challenge_attempts_pkey" PRIMARY KEY using index "challenge_attempts_pkey";

alter table "public"."collection_items" add constraint "collection_items_pkey" PRIMARY KEY using index "collection_items_pkey";

alter table "public"."collection_questions" add constraint "collection_questions_pkey" PRIMARY KEY using index "collection_questions_pkey";

alter table "public"."collections" add constraint "collections_pkey" PRIMARY KEY using index "collections_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."community_exams" add constraint "community_exams_pkey" PRIMARY KEY using index "community_exams_pkey";

alter table "public"."daily_activities" add constraint "daily_activities_pkey" PRIMARY KEY using index "daily_activities_pkey";

alter table "public"."edit_suggestions" add constraint "edit_suggestions_pkey" PRIMARY KEY using index "edit_suggestions_pkey";

alter table "public"."exam_history" add constraint "exam_history_pkey" PRIMARY KEY using index "exam_history_pkey";

alter table "public"."exam_questions" add constraint "exam_questions_pkey" PRIMARY KEY using index "exam_questions_pkey";

alter table "public"."exam_ratings" add constraint "exam_ratings_pkey" PRIMARY KEY using index "exam_ratings_pkey";

alter table "public"."exams" add constraint "exams_pkey" PRIMARY KEY using index "exams_pkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."question_attempts" add constraint "question_attempts_pkey" PRIMARY KEY using index "question_attempts_pkey";

alter table "public"."question_collections" add constraint "question_collections_pkey" PRIMARY KEY using index "question_collections_pkey";

alter table "public"."question_imports" add constraint "question_imports_pkey" PRIMARY KEY using index "question_imports_pkey";

alter table "public"."question_of_day" add constraint "question_of_day_pkey" PRIMARY KEY using index "question_of_day_pkey";

alter table "public"."question_views" add constraint "question_views_pkey" PRIMARY KEY using index "question_views_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."saved_exams" add constraint "saved_exams_pkey" PRIMARY KEY using index "saved_exams_pkey";

alter table "public"."study_streaks" add constraint "study_streaks_pkey" PRIMARY KEY using index "study_streaks_pkey";

alter table "public"."system_settings" add constraint "system_settings_pkey" PRIMARY KEY using index "system_settings_pkey";

alter table "public"."topics" add constraint "topics_pkey" PRIMARY KEY using index "topics_pkey";

alter table "public"."user_badges" add constraint "user_badges_pkey" PRIMARY KEY using index "user_badges_pkey";

alter table "public"."votes" add constraint "votes_pkey" PRIMARY KEY using index "votes_pkey";

alter table "public"."weekly_challenges" add constraint "weekly_challenges_pkey" PRIMARY KEY using index "weekly_challenges_pkey";

alter table "public"."announcement_views" add constraint "announcement_views_announcement_id_fkey" FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE not valid;

alter table "public"."announcement_views" validate constraint "announcement_views_announcement_id_fkey";

alter table "public"."announcement_views" add constraint "announcement_views_announcement_id_user_id_key" UNIQUE using index "announcement_views_announcement_id_user_id_key";

alter table "public"."announcements" add constraint "announcements_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."announcements" validate constraint "announcements_created_by_fkey";

alter table "public"."announcements" add constraint "announcements_type_check" CHECK ((type = ANY (ARRAY['info'::text, 'warning'::text, 'success'::text, 'error'::text]))) not valid;

alter table "public"."announcements" validate constraint "announcements_type_check";

alter table "public"."badges" add constraint "badges_name_key" UNIQUE using index "badges_name_key";

alter table "public"."bookmarks" add constraint "bookmarks_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_question_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_user_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_user_id_question_id_key" UNIQUE using index "bookmarks_user_id_question_id_key";

alter table "public"."challenge_attempts" add constraint "challenge_attempts_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES public.weekly_challenges(id) ON DELETE CASCADE not valid;

alter table "public"."challenge_attempts" validate constraint "challenge_attempts_challenge_id_fkey";

alter table "public"."challenge_attempts" add constraint "challenge_attempts_challenge_id_user_id_key" UNIQUE using index "challenge_attempts_challenge_id_user_id_key";

alter table "public"."challenge_attempts" add constraint "challenge_attempts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."challenge_attempts" validate constraint "challenge_attempts_user_id_fkey";

alter table "public"."collection_items" add constraint "collection_items_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE not valid;

alter table "public"."collection_items" validate constraint "collection_items_collection_id_fkey";

alter table "public"."collection_items" add constraint "collection_items_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."collection_items" validate constraint "collection_items_question_id_fkey";

alter table "public"."collection_questions" add constraint "collection_questions_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES public.question_collections(id) ON DELETE CASCADE not valid;

alter table "public"."collection_questions" validate constraint "collection_questions_collection_id_fkey";

alter table "public"."collection_questions" add constraint "collection_questions_collection_id_question_id_key" UNIQUE using index "collection_questions_collection_id_question_id_key";

alter table "public"."collection_questions" add constraint "collection_questions_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."collection_questions" validate constraint "collection_questions_question_id_fkey";

alter table "public"."collections" add constraint "collections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."collections" validate constraint "collections_user_id_fkey";

alter table "public"."comments" add constraint "comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."comments" validate constraint "comments_author_id_fkey";

alter table "public"."comments" add constraint "comments_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_question_id_fkey";

alter table "public"."community_exams" add constraint "community_exams_difficulty_check" CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'mixed'::text]))) not valid;

alter table "public"."community_exams" validate constraint "community_exams_difficulty_check";

alter table "public"."daily_activities" add constraint "daily_activities_user_id_activity_date_key" UNIQUE using index "daily_activities_user_id_activity_date_key";

alter table "public"."edit_suggestions" add constraint "edit_suggestions_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."edit_suggestions" validate constraint "edit_suggestions_question_id_fkey";

alter table "public"."edit_suggestions" add constraint "edit_suggestions_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."edit_suggestions" validate constraint "edit_suggestions_reviewed_by_fkey";

alter table "public"."edit_suggestions" add constraint "edit_suggestions_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."edit_suggestions" validate constraint "edit_suggestions_status_check";

alter table "public"."edit_suggestions" add constraint "edit_suggestions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."edit_suggestions" validate constraint "edit_suggestions_user_id_fkey";

alter table "public"."exam_history" add constraint "exam_history_community_exam_id_fkey" FOREIGN KEY (community_exam_id) REFERENCES public.community_exams(id) ON DELETE SET NULL not valid;

alter table "public"."exam_history" validate constraint "exam_history_community_exam_id_fkey";

alter table "public"."exam_history" add constraint "exam_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."exam_history" validate constraint "exam_history_user_id_fkey";

alter table "public"."exam_questions" add constraint "exam_questions_exam_id_fkey" FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE not valid;

alter table "public"."exam_questions" validate constraint "exam_questions_exam_id_fkey";

alter table "public"."exam_questions" add constraint "exam_questions_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."exam_questions" validate constraint "exam_questions_question_id_fkey";

alter table "public"."exam_ratings" add constraint "exam_ratings_exam_id_fkey" FOREIGN KEY (exam_id) REFERENCES public.community_exams(id) ON DELETE CASCADE not valid;

alter table "public"."exam_ratings" validate constraint "exam_ratings_exam_id_fkey";

alter table "public"."exam_ratings" add constraint "exam_ratings_exam_id_user_id_key" UNIQUE using index "exam_ratings_exam_id_user_id_key";

alter table "public"."exam_ratings" add constraint "exam_ratings_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."exam_ratings" validate constraint "exam_ratings_rating_check";

alter table "public"."exams" add constraint "exams_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) not valid;

alter table "public"."exams" validate constraint "exams_author_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "notification_preferences_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."question_attempts" add constraint "question_attempts_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."question_attempts" validate constraint "question_attempts_question_id_fkey";

alter table "public"."question_attempts" add constraint "question_attempts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."question_attempts" validate constraint "question_attempts_user_id_fkey";

alter table "public"."question_attempts" add constraint "question_attempts_user_id_question_id_key" UNIQUE using index "question_attempts_user_id_question_id_key";

alter table "public"."question_collections" add constraint "question_collections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."question_collections" validate constraint "question_collections_user_id_fkey";

alter table "public"."question_imports" add constraint "question_imports_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'failed'::text]))) not valid;

alter table "public"."question_imports" validate constraint "question_imports_status_check";

alter table "public"."question_imports" add constraint "question_imports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."question_imports" validate constraint "question_imports_user_id_fkey";

alter table "public"."question_of_day" add constraint "question_of_day_date_key" UNIQUE using index "question_of_day_date_key";

alter table "public"."question_of_day" add constraint "question_of_day_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."question_of_day" validate constraint "question_of_day_question_id_fkey";

alter table "public"."question_views" add constraint "question_views_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."question_views" validate constraint "question_views_question_id_fkey";

alter table "public"."question_views" add constraint "question_views_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."question_views" validate constraint "question_views_user_id_fkey";

alter table "public"."questions" add constraint "questions_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."questions" validate constraint "questions_author_id_fkey";

alter table "public"."questions" add constraint "questions_correct_answer_check" CHECK ((correct_answer = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar]))) not valid;

alter table "public"."questions" validate constraint "questions_correct_answer_check";

alter table "public"."questions" add constraint "questions_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."questions" validate constraint "questions_reviewed_by_fkey";

alter table "public"."questions" add constraint "questions_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE not valid;

alter table "public"."questions" validate constraint "questions_topic_id_fkey";

alter table "public"."reports" add constraint "reports_check" CHECK ((((question_id IS NOT NULL) AND (comment_id IS NULL)) OR ((question_id IS NULL) AND (comment_id IS NOT NULL)))) not valid;

alter table "public"."reports" validate constraint "reports_check";

alter table "public"."reports" add constraint "reports_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_comment_id_fkey";

alter table "public"."reports" add constraint "reports_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_question_id_fkey";

alter table "public"."reports" add constraint "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_reporter_id_fkey";

alter table "public"."reports" add constraint "reports_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_reviewed_by_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";

alter table "public"."saved_exams" add constraint "saved_exams_exam_id_fkey" FOREIGN KEY (exam_id) REFERENCES public.community_exams(id) ON DELETE CASCADE not valid;

alter table "public"."saved_exams" validate constraint "saved_exams_exam_id_fkey";

alter table "public"."saved_exams" add constraint "saved_exams_user_id_exam_id_key" UNIQUE using index "saved_exams_user_id_exam_id_key";

alter table "public"."study_streaks" add constraint "study_streaks_user_id_key" UNIQUE using index "study_streaks_user_id_key";

alter table "public"."system_settings" add constraint "system_settings_setting_key_key" UNIQUE using index "system_settings_setting_key_key";

alter table "public"."topics" add constraint "topics_code_unique" UNIQUE using index "topics_code_unique";

alter table "public"."user_badges" add constraint "user_badges_badge_id_fkey" FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE not valid;

alter table "public"."user_badges" validate constraint "user_badges_badge_id_fkey";

alter table "public"."user_badges" add constraint "user_badges_user_id_badge_id_key" UNIQUE using index "user_badges_user_id_badge_id_key";

alter table "public"."user_badges" add constraint "user_badges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_badges" validate constraint "user_badges_user_id_fkey";

alter table "public"."votes" add constraint "votes_check" CHECK ((((question_id IS NOT NULL) AND (comment_id IS NULL)) OR ((question_id IS NULL) AND (comment_id IS NOT NULL)))) not valid;

alter table "public"."votes" validate constraint "votes_check";

alter table "public"."votes" add constraint "votes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_comment_id_fkey";

alter table "public"."votes" add constraint "votes_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_question_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_comment_id_key" UNIQUE using index "votes_user_id_comment_id_key";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_question_id_key" UNIQUE using index "votes_user_id_question_id_key";

alter table "public"."votes" add constraint "votes_vote_type_check" CHECK ((vote_type = ANY (ARRAY['-1'::integer, 1]))) not valid;

alter table "public"."votes" validate constraint "votes_vote_type_check";

alter table "public"."weekly_challenges" add constraint "weekly_challenges_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES public.topics(id) not valid;

alter table "public"."weekly_challenges" validate constraint "weekly_challenges_topic_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, null, 'user');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_topic_question_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- INSERT: if new question is approved, increment
  if (tg_op = 'INSERT') then
    if (new.status = 'approved' and new.topic_id is not null) then
      update public.topics
      set question_count = coalesce(question_count, 0) + 1
      where id = new.topic_id;
    end if;
    return new;
  end if;

  -- UPDATE: handle status/topic transitions
  if (tg_op = 'UPDATE') then

    -- Case A: approved -> not approved (decrement old topic)
    if (old.status = 'approved' and new.status <> 'approved') then
      if (old.topic_id is not null) then
        update public.topics
        set question_count = greatest(coalesce(question_count, 0) - 1, 0)
        where id = old.topic_id;
      end if;
    end if;

    -- Case B: not approved -> approved (increment new topic)
    if (old.status <> 'approved' and new.status = 'approved') then
      if (new.topic_id is not null) then
        update public.topics
        set question_count = coalesce(question_count, 0) + 1
        where id = new.topic_id;
      end if;
    end if;

    -- Case C: approved and topic changed (move count)
    if (old.status = 'approved' and new.status = 'approved' and old.topic_id is distinct from new.topic_id) then
      if (old.topic_id is not null) then
        update public.topics
        set question_count = greatest(coalesce(question_count, 0) - 1, 0)
        where id = old.topic_id;
      end if;

      if (new.topic_id is not null) then
        update public.topics
        set question_count = coalesce(question_count, 0) + 1
        where id = new.topic_id;
      end if;
    end if;

    return new;
  end if;

  -- DELETE: if deleted question was approved, decrement
  if (tg_op = 'DELETE') then
    if (old.status = 'approved' and old.topic_id is not null) then
      update public.topics
      set question_count = greatest(coalesce(question_count, 0) - 1, 0)
      where id = old.topic_id;
    end if;
    return old;
  end if;

  return null;
end;
$function$
;

grant delete on table "public"."announcement_views" to "anon";

grant insert on table "public"."announcement_views" to "anon";

grant references on table "public"."announcement_views" to "anon";

grant select on table "public"."announcement_views" to "anon";

grant trigger on table "public"."announcement_views" to "anon";

grant truncate on table "public"."announcement_views" to "anon";

grant update on table "public"."announcement_views" to "anon";

grant delete on table "public"."announcement_views" to "authenticated";

grant insert on table "public"."announcement_views" to "authenticated";

grant references on table "public"."announcement_views" to "authenticated";

grant select on table "public"."announcement_views" to "authenticated";

grant trigger on table "public"."announcement_views" to "authenticated";

grant truncate on table "public"."announcement_views" to "authenticated";

grant update on table "public"."announcement_views" to "authenticated";

grant delete on table "public"."announcement_views" to "service_role";

grant insert on table "public"."announcement_views" to "service_role";

grant references on table "public"."announcement_views" to "service_role";

grant select on table "public"."announcement_views" to "service_role";

grant trigger on table "public"."announcement_views" to "service_role";

grant truncate on table "public"."announcement_views" to "service_role";

grant update on table "public"."announcement_views" to "service_role";

grant delete on table "public"."announcements" to "anon";

grant insert on table "public"."announcements" to "anon";

grant references on table "public"."announcements" to "anon";

grant select on table "public"."announcements" to "anon";

grant trigger on table "public"."announcements" to "anon";

grant truncate on table "public"."announcements" to "anon";

grant update on table "public"."announcements" to "anon";

grant delete on table "public"."announcements" to "authenticated";

grant insert on table "public"."announcements" to "authenticated";

grant references on table "public"."announcements" to "authenticated";

grant select on table "public"."announcements" to "authenticated";

grant trigger on table "public"."announcements" to "authenticated";

grant truncate on table "public"."announcements" to "authenticated";

grant update on table "public"."announcements" to "authenticated";

grant delete on table "public"."announcements" to "service_role";

grant insert on table "public"."announcements" to "service_role";

grant references on table "public"."announcements" to "service_role";

grant select on table "public"."announcements" to "service_role";

grant trigger on table "public"."announcements" to "service_role";

grant truncate on table "public"."announcements" to "service_role";

grant update on table "public"."announcements" to "service_role";

grant delete on table "public"."badges" to "anon";

grant insert on table "public"."badges" to "anon";

grant references on table "public"."badges" to "anon";

grant select on table "public"."badges" to "anon";

grant trigger on table "public"."badges" to "anon";

grant truncate on table "public"."badges" to "anon";

grant update on table "public"."badges" to "anon";

grant delete on table "public"."badges" to "authenticated";

grant insert on table "public"."badges" to "authenticated";

grant references on table "public"."badges" to "authenticated";

grant select on table "public"."badges" to "authenticated";

grant trigger on table "public"."badges" to "authenticated";

grant truncate on table "public"."badges" to "authenticated";

grant update on table "public"."badges" to "authenticated";

grant delete on table "public"."badges" to "service_role";

grant insert on table "public"."badges" to "service_role";

grant references on table "public"."badges" to "service_role";

grant select on table "public"."badges" to "service_role";

grant trigger on table "public"."badges" to "service_role";

grant truncate on table "public"."badges" to "service_role";

grant update on table "public"."badges" to "service_role";

grant delete on table "public"."bookmarks" to "anon";

grant insert on table "public"."bookmarks" to "anon";

grant references on table "public"."bookmarks" to "anon";

grant select on table "public"."bookmarks" to "anon";

grant trigger on table "public"."bookmarks" to "anon";

grant truncate on table "public"."bookmarks" to "anon";

grant update on table "public"."bookmarks" to "anon";

grant delete on table "public"."bookmarks" to "authenticated";

grant insert on table "public"."bookmarks" to "authenticated";

grant references on table "public"."bookmarks" to "authenticated";

grant select on table "public"."bookmarks" to "authenticated";

grant trigger on table "public"."bookmarks" to "authenticated";

grant truncate on table "public"."bookmarks" to "authenticated";

grant update on table "public"."bookmarks" to "authenticated";

grant delete on table "public"."bookmarks" to "service_role";

grant insert on table "public"."bookmarks" to "service_role";

grant references on table "public"."bookmarks" to "service_role";

grant select on table "public"."bookmarks" to "service_role";

grant trigger on table "public"."bookmarks" to "service_role";

grant truncate on table "public"."bookmarks" to "service_role";

grant update on table "public"."bookmarks" to "service_role";

grant delete on table "public"."challenge_attempts" to "anon";

grant insert on table "public"."challenge_attempts" to "anon";

grant references on table "public"."challenge_attempts" to "anon";

grant select on table "public"."challenge_attempts" to "anon";

grant trigger on table "public"."challenge_attempts" to "anon";

grant truncate on table "public"."challenge_attempts" to "anon";

grant update on table "public"."challenge_attempts" to "anon";

grant delete on table "public"."challenge_attempts" to "authenticated";

grant insert on table "public"."challenge_attempts" to "authenticated";

grant references on table "public"."challenge_attempts" to "authenticated";

grant select on table "public"."challenge_attempts" to "authenticated";

grant trigger on table "public"."challenge_attempts" to "authenticated";

grant truncate on table "public"."challenge_attempts" to "authenticated";

grant update on table "public"."challenge_attempts" to "authenticated";

grant delete on table "public"."challenge_attempts" to "service_role";

grant insert on table "public"."challenge_attempts" to "service_role";

grant references on table "public"."challenge_attempts" to "service_role";

grant select on table "public"."challenge_attempts" to "service_role";

grant trigger on table "public"."challenge_attempts" to "service_role";

grant truncate on table "public"."challenge_attempts" to "service_role";

grant update on table "public"."challenge_attempts" to "service_role";

grant delete on table "public"."collection_items" to "anon";

grant insert on table "public"."collection_items" to "anon";

grant references on table "public"."collection_items" to "anon";

grant select on table "public"."collection_items" to "anon";

grant trigger on table "public"."collection_items" to "anon";

grant truncate on table "public"."collection_items" to "anon";

grant update on table "public"."collection_items" to "anon";

grant delete on table "public"."collection_items" to "authenticated";

grant insert on table "public"."collection_items" to "authenticated";

grant references on table "public"."collection_items" to "authenticated";

grant select on table "public"."collection_items" to "authenticated";

grant trigger on table "public"."collection_items" to "authenticated";

grant truncate on table "public"."collection_items" to "authenticated";

grant update on table "public"."collection_items" to "authenticated";

grant delete on table "public"."collection_items" to "service_role";

grant insert on table "public"."collection_items" to "service_role";

grant references on table "public"."collection_items" to "service_role";

grant select on table "public"."collection_items" to "service_role";

grant trigger on table "public"."collection_items" to "service_role";

grant truncate on table "public"."collection_items" to "service_role";

grant update on table "public"."collection_items" to "service_role";

grant delete on table "public"."collection_questions" to "anon";

grant insert on table "public"."collection_questions" to "anon";

grant references on table "public"."collection_questions" to "anon";

grant select on table "public"."collection_questions" to "anon";

grant trigger on table "public"."collection_questions" to "anon";

grant truncate on table "public"."collection_questions" to "anon";

grant update on table "public"."collection_questions" to "anon";

grant delete on table "public"."collection_questions" to "authenticated";

grant insert on table "public"."collection_questions" to "authenticated";

grant references on table "public"."collection_questions" to "authenticated";

grant select on table "public"."collection_questions" to "authenticated";

grant trigger on table "public"."collection_questions" to "authenticated";

grant truncate on table "public"."collection_questions" to "authenticated";

grant update on table "public"."collection_questions" to "authenticated";

grant delete on table "public"."collection_questions" to "service_role";

grant insert on table "public"."collection_questions" to "service_role";

grant references on table "public"."collection_questions" to "service_role";

grant select on table "public"."collection_questions" to "service_role";

grant trigger on table "public"."collection_questions" to "service_role";

grant truncate on table "public"."collection_questions" to "service_role";

grant update on table "public"."collection_questions" to "service_role";

grant delete on table "public"."collections" to "anon";

grant insert on table "public"."collections" to "anon";

grant references on table "public"."collections" to "anon";

grant select on table "public"."collections" to "anon";

grant trigger on table "public"."collections" to "anon";

grant truncate on table "public"."collections" to "anon";

grant update on table "public"."collections" to "anon";

grant delete on table "public"."collections" to "authenticated";

grant insert on table "public"."collections" to "authenticated";

grant references on table "public"."collections" to "authenticated";

grant select on table "public"."collections" to "authenticated";

grant trigger on table "public"."collections" to "authenticated";

grant truncate on table "public"."collections" to "authenticated";

grant update on table "public"."collections" to "authenticated";

grant delete on table "public"."collections" to "service_role";

grant insert on table "public"."collections" to "service_role";

grant references on table "public"."collections" to "service_role";

grant select on table "public"."collections" to "service_role";

grant trigger on table "public"."collections" to "service_role";

grant truncate on table "public"."collections" to "service_role";

grant update on table "public"."collections" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."community_exams" to "anon";

grant insert on table "public"."community_exams" to "anon";

grant references on table "public"."community_exams" to "anon";

grant select on table "public"."community_exams" to "anon";

grant trigger on table "public"."community_exams" to "anon";

grant truncate on table "public"."community_exams" to "anon";

grant update on table "public"."community_exams" to "anon";

grant delete on table "public"."community_exams" to "authenticated";

grant insert on table "public"."community_exams" to "authenticated";

grant references on table "public"."community_exams" to "authenticated";

grant select on table "public"."community_exams" to "authenticated";

grant trigger on table "public"."community_exams" to "authenticated";

grant truncate on table "public"."community_exams" to "authenticated";

grant update on table "public"."community_exams" to "authenticated";

grant delete on table "public"."community_exams" to "service_role";

grant insert on table "public"."community_exams" to "service_role";

grant references on table "public"."community_exams" to "service_role";

grant select on table "public"."community_exams" to "service_role";

grant trigger on table "public"."community_exams" to "service_role";

grant truncate on table "public"."community_exams" to "service_role";

grant update on table "public"."community_exams" to "service_role";

grant delete on table "public"."daily_activities" to "anon";

grant insert on table "public"."daily_activities" to "anon";

grant references on table "public"."daily_activities" to "anon";

grant select on table "public"."daily_activities" to "anon";

grant trigger on table "public"."daily_activities" to "anon";

grant truncate on table "public"."daily_activities" to "anon";

grant update on table "public"."daily_activities" to "anon";

grant delete on table "public"."daily_activities" to "authenticated";

grant insert on table "public"."daily_activities" to "authenticated";

grant references on table "public"."daily_activities" to "authenticated";

grant select on table "public"."daily_activities" to "authenticated";

grant trigger on table "public"."daily_activities" to "authenticated";

grant truncate on table "public"."daily_activities" to "authenticated";

grant update on table "public"."daily_activities" to "authenticated";

grant delete on table "public"."daily_activities" to "service_role";

grant insert on table "public"."daily_activities" to "service_role";

grant references on table "public"."daily_activities" to "service_role";

grant select on table "public"."daily_activities" to "service_role";

grant trigger on table "public"."daily_activities" to "service_role";

grant truncate on table "public"."daily_activities" to "service_role";

grant update on table "public"."daily_activities" to "service_role";

grant delete on table "public"."edit_suggestions" to "anon";

grant insert on table "public"."edit_suggestions" to "anon";

grant references on table "public"."edit_suggestions" to "anon";

grant select on table "public"."edit_suggestions" to "anon";

grant trigger on table "public"."edit_suggestions" to "anon";

grant truncate on table "public"."edit_suggestions" to "anon";

grant update on table "public"."edit_suggestions" to "anon";

grant delete on table "public"."edit_suggestions" to "authenticated";

grant insert on table "public"."edit_suggestions" to "authenticated";

grant references on table "public"."edit_suggestions" to "authenticated";

grant select on table "public"."edit_suggestions" to "authenticated";

grant trigger on table "public"."edit_suggestions" to "authenticated";

grant truncate on table "public"."edit_suggestions" to "authenticated";

grant update on table "public"."edit_suggestions" to "authenticated";

grant delete on table "public"."edit_suggestions" to "service_role";

grant insert on table "public"."edit_suggestions" to "service_role";

grant references on table "public"."edit_suggestions" to "service_role";

grant select on table "public"."edit_suggestions" to "service_role";

grant trigger on table "public"."edit_suggestions" to "service_role";

grant truncate on table "public"."edit_suggestions" to "service_role";

grant update on table "public"."edit_suggestions" to "service_role";

grant delete on table "public"."exam_history" to "anon";

grant insert on table "public"."exam_history" to "anon";

grant references on table "public"."exam_history" to "anon";

grant select on table "public"."exam_history" to "anon";

grant trigger on table "public"."exam_history" to "anon";

grant truncate on table "public"."exam_history" to "anon";

grant update on table "public"."exam_history" to "anon";

grant delete on table "public"."exam_history" to "authenticated";

grant insert on table "public"."exam_history" to "authenticated";

grant references on table "public"."exam_history" to "authenticated";

grant select on table "public"."exam_history" to "authenticated";

grant trigger on table "public"."exam_history" to "authenticated";

grant truncate on table "public"."exam_history" to "authenticated";

grant update on table "public"."exam_history" to "authenticated";

grant delete on table "public"."exam_history" to "service_role";

grant insert on table "public"."exam_history" to "service_role";

grant references on table "public"."exam_history" to "service_role";

grant select on table "public"."exam_history" to "service_role";

grant trigger on table "public"."exam_history" to "service_role";

grant truncate on table "public"."exam_history" to "service_role";

grant update on table "public"."exam_history" to "service_role";

grant delete on table "public"."exam_questions" to "anon";

grant insert on table "public"."exam_questions" to "anon";

grant references on table "public"."exam_questions" to "anon";

grant select on table "public"."exam_questions" to "anon";

grant trigger on table "public"."exam_questions" to "anon";

grant truncate on table "public"."exam_questions" to "anon";

grant update on table "public"."exam_questions" to "anon";

grant delete on table "public"."exam_questions" to "authenticated";

grant insert on table "public"."exam_questions" to "authenticated";

grant references on table "public"."exam_questions" to "authenticated";

grant select on table "public"."exam_questions" to "authenticated";

grant trigger on table "public"."exam_questions" to "authenticated";

grant truncate on table "public"."exam_questions" to "authenticated";

grant update on table "public"."exam_questions" to "authenticated";

grant delete on table "public"."exam_questions" to "service_role";

grant insert on table "public"."exam_questions" to "service_role";

grant references on table "public"."exam_questions" to "service_role";

grant select on table "public"."exam_questions" to "service_role";

grant trigger on table "public"."exam_questions" to "service_role";

grant truncate on table "public"."exam_questions" to "service_role";

grant update on table "public"."exam_questions" to "service_role";

grant delete on table "public"."exam_ratings" to "anon";

grant insert on table "public"."exam_ratings" to "anon";

grant references on table "public"."exam_ratings" to "anon";

grant select on table "public"."exam_ratings" to "anon";

grant trigger on table "public"."exam_ratings" to "anon";

grant truncate on table "public"."exam_ratings" to "anon";

grant update on table "public"."exam_ratings" to "anon";

grant delete on table "public"."exam_ratings" to "authenticated";

grant insert on table "public"."exam_ratings" to "authenticated";

grant references on table "public"."exam_ratings" to "authenticated";

grant select on table "public"."exam_ratings" to "authenticated";

grant trigger on table "public"."exam_ratings" to "authenticated";

grant truncate on table "public"."exam_ratings" to "authenticated";

grant update on table "public"."exam_ratings" to "authenticated";

grant delete on table "public"."exam_ratings" to "service_role";

grant insert on table "public"."exam_ratings" to "service_role";

grant references on table "public"."exam_ratings" to "service_role";

grant select on table "public"."exam_ratings" to "service_role";

grant trigger on table "public"."exam_ratings" to "service_role";

grant truncate on table "public"."exam_ratings" to "service_role";

grant update on table "public"."exam_ratings" to "service_role";

grant delete on table "public"."exams" to "anon";

grant insert on table "public"."exams" to "anon";

grant references on table "public"."exams" to "anon";

grant select on table "public"."exams" to "anon";

grant trigger on table "public"."exams" to "anon";

grant truncate on table "public"."exams" to "anon";

grant update on table "public"."exams" to "anon";

grant delete on table "public"."exams" to "authenticated";

grant insert on table "public"."exams" to "authenticated";

grant references on table "public"."exams" to "authenticated";

grant select on table "public"."exams" to "authenticated";

grant trigger on table "public"."exams" to "authenticated";

grant truncate on table "public"."exams" to "authenticated";

grant update on table "public"."exams" to "authenticated";

grant delete on table "public"."exams" to "service_role";

grant insert on table "public"."exams" to "service_role";

grant references on table "public"."exams" to "service_role";

grant select on table "public"."exams" to "service_role";

grant trigger on table "public"."exams" to "service_role";

grant truncate on table "public"."exams" to "service_role";

grant update on table "public"."exams" to "service_role";

grant delete on table "public"."notification_preferences" to "anon";

grant insert on table "public"."notification_preferences" to "anon";

grant references on table "public"."notification_preferences" to "anon";

grant select on table "public"."notification_preferences" to "anon";

grant trigger on table "public"."notification_preferences" to "anon";

grant truncate on table "public"."notification_preferences" to "anon";

grant update on table "public"."notification_preferences" to "anon";

grant delete on table "public"."notification_preferences" to "authenticated";

grant insert on table "public"."notification_preferences" to "authenticated";

grant references on table "public"."notification_preferences" to "authenticated";

grant select on table "public"."notification_preferences" to "authenticated";

grant trigger on table "public"."notification_preferences" to "authenticated";

grant truncate on table "public"."notification_preferences" to "authenticated";

grant update on table "public"."notification_preferences" to "authenticated";

grant delete on table "public"."notification_preferences" to "service_role";

grant insert on table "public"."notification_preferences" to "service_role";

grant references on table "public"."notification_preferences" to "service_role";

grant select on table "public"."notification_preferences" to "service_role";

grant trigger on table "public"."notification_preferences" to "service_role";

grant truncate on table "public"."notification_preferences" to "service_role";

grant update on table "public"."notification_preferences" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."question_attempts" to "anon";

grant insert on table "public"."question_attempts" to "anon";

grant references on table "public"."question_attempts" to "anon";

grant select on table "public"."question_attempts" to "anon";

grant trigger on table "public"."question_attempts" to "anon";

grant truncate on table "public"."question_attempts" to "anon";

grant update on table "public"."question_attempts" to "anon";

grant delete on table "public"."question_attempts" to "authenticated";

grant insert on table "public"."question_attempts" to "authenticated";

grant references on table "public"."question_attempts" to "authenticated";

grant select on table "public"."question_attempts" to "authenticated";

grant trigger on table "public"."question_attempts" to "authenticated";

grant truncate on table "public"."question_attempts" to "authenticated";

grant update on table "public"."question_attempts" to "authenticated";

grant delete on table "public"."question_attempts" to "service_role";

grant insert on table "public"."question_attempts" to "service_role";

grant references on table "public"."question_attempts" to "service_role";

grant select on table "public"."question_attempts" to "service_role";

grant trigger on table "public"."question_attempts" to "service_role";

grant truncate on table "public"."question_attempts" to "service_role";

grant update on table "public"."question_attempts" to "service_role";

grant delete on table "public"."question_collections" to "anon";

grant insert on table "public"."question_collections" to "anon";

grant references on table "public"."question_collections" to "anon";

grant select on table "public"."question_collections" to "anon";

grant trigger on table "public"."question_collections" to "anon";

grant truncate on table "public"."question_collections" to "anon";

grant update on table "public"."question_collections" to "anon";

grant delete on table "public"."question_collections" to "authenticated";

grant insert on table "public"."question_collections" to "authenticated";

grant references on table "public"."question_collections" to "authenticated";

grant select on table "public"."question_collections" to "authenticated";

grant trigger on table "public"."question_collections" to "authenticated";

grant truncate on table "public"."question_collections" to "authenticated";

grant update on table "public"."question_collections" to "authenticated";

grant delete on table "public"."question_collections" to "service_role";

grant insert on table "public"."question_collections" to "service_role";

grant references on table "public"."question_collections" to "service_role";

grant select on table "public"."question_collections" to "service_role";

grant trigger on table "public"."question_collections" to "service_role";

grant truncate on table "public"."question_collections" to "service_role";

grant update on table "public"."question_collections" to "service_role";

grant delete on table "public"."question_imports" to "anon";

grant insert on table "public"."question_imports" to "anon";

grant references on table "public"."question_imports" to "anon";

grant select on table "public"."question_imports" to "anon";

grant trigger on table "public"."question_imports" to "anon";

grant truncate on table "public"."question_imports" to "anon";

grant update on table "public"."question_imports" to "anon";

grant delete on table "public"."question_imports" to "authenticated";

grant insert on table "public"."question_imports" to "authenticated";

grant references on table "public"."question_imports" to "authenticated";

grant select on table "public"."question_imports" to "authenticated";

grant trigger on table "public"."question_imports" to "authenticated";

grant truncate on table "public"."question_imports" to "authenticated";

grant update on table "public"."question_imports" to "authenticated";

grant delete on table "public"."question_imports" to "service_role";

grant insert on table "public"."question_imports" to "service_role";

grant references on table "public"."question_imports" to "service_role";

grant select on table "public"."question_imports" to "service_role";

grant trigger on table "public"."question_imports" to "service_role";

grant truncate on table "public"."question_imports" to "service_role";

grant update on table "public"."question_imports" to "service_role";

grant delete on table "public"."question_of_day" to "anon";

grant insert on table "public"."question_of_day" to "anon";

grant references on table "public"."question_of_day" to "anon";

grant select on table "public"."question_of_day" to "anon";

grant trigger on table "public"."question_of_day" to "anon";

grant truncate on table "public"."question_of_day" to "anon";

grant update on table "public"."question_of_day" to "anon";

grant delete on table "public"."question_of_day" to "authenticated";

grant insert on table "public"."question_of_day" to "authenticated";

grant references on table "public"."question_of_day" to "authenticated";

grant select on table "public"."question_of_day" to "authenticated";

grant trigger on table "public"."question_of_day" to "authenticated";

grant truncate on table "public"."question_of_day" to "authenticated";

grant update on table "public"."question_of_day" to "authenticated";

grant delete on table "public"."question_of_day" to "service_role";

grant insert on table "public"."question_of_day" to "service_role";

grant references on table "public"."question_of_day" to "service_role";

grant select on table "public"."question_of_day" to "service_role";

grant trigger on table "public"."question_of_day" to "service_role";

grant truncate on table "public"."question_of_day" to "service_role";

grant update on table "public"."question_of_day" to "service_role";

grant delete on table "public"."question_views" to "anon";

grant insert on table "public"."question_views" to "anon";

grant references on table "public"."question_views" to "anon";

grant select on table "public"."question_views" to "anon";

grant trigger on table "public"."question_views" to "anon";

grant truncate on table "public"."question_views" to "anon";

grant update on table "public"."question_views" to "anon";

grant delete on table "public"."question_views" to "authenticated";

grant insert on table "public"."question_views" to "authenticated";

grant references on table "public"."question_views" to "authenticated";

grant select on table "public"."question_views" to "authenticated";

grant trigger on table "public"."question_views" to "authenticated";

grant truncate on table "public"."question_views" to "authenticated";

grant update on table "public"."question_views" to "authenticated";

grant delete on table "public"."question_views" to "service_role";

grant insert on table "public"."question_views" to "service_role";

grant references on table "public"."question_views" to "service_role";

grant select on table "public"."question_views" to "service_role";

grant trigger on table "public"."question_views" to "service_role";

grant truncate on table "public"."question_views" to "service_role";

grant update on table "public"."question_views" to "service_role";

grant delete on table "public"."questions" to "anon";

grant insert on table "public"."questions" to "anon";

grant references on table "public"."questions" to "anon";

grant select on table "public"."questions" to "anon";

grant trigger on table "public"."questions" to "anon";

grant truncate on table "public"."questions" to "anon";

grant update on table "public"."questions" to "anon";

grant delete on table "public"."questions" to "authenticated";

grant insert on table "public"."questions" to "authenticated";

grant references on table "public"."questions" to "authenticated";

grant select on table "public"."questions" to "authenticated";

grant trigger on table "public"."questions" to "authenticated";

grant truncate on table "public"."questions" to "authenticated";

grant update on table "public"."questions" to "authenticated";

grant delete on table "public"."questions" to "service_role";

grant insert on table "public"."questions" to "service_role";

grant references on table "public"."questions" to "service_role";

grant select on table "public"."questions" to "service_role";

grant trigger on table "public"."questions" to "service_role";

grant truncate on table "public"."questions" to "service_role";

grant update on table "public"."questions" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant delete on table "public"."saved_exams" to "anon";

grant insert on table "public"."saved_exams" to "anon";

grant references on table "public"."saved_exams" to "anon";

grant select on table "public"."saved_exams" to "anon";

grant trigger on table "public"."saved_exams" to "anon";

grant truncate on table "public"."saved_exams" to "anon";

grant update on table "public"."saved_exams" to "anon";

grant delete on table "public"."saved_exams" to "authenticated";

grant insert on table "public"."saved_exams" to "authenticated";

grant references on table "public"."saved_exams" to "authenticated";

grant select on table "public"."saved_exams" to "authenticated";

grant trigger on table "public"."saved_exams" to "authenticated";

grant truncate on table "public"."saved_exams" to "authenticated";

grant update on table "public"."saved_exams" to "authenticated";

grant delete on table "public"."saved_exams" to "service_role";

grant insert on table "public"."saved_exams" to "service_role";

grant references on table "public"."saved_exams" to "service_role";

grant select on table "public"."saved_exams" to "service_role";

grant trigger on table "public"."saved_exams" to "service_role";

grant truncate on table "public"."saved_exams" to "service_role";

grant update on table "public"."saved_exams" to "service_role";

grant delete on table "public"."study_streaks" to "anon";

grant insert on table "public"."study_streaks" to "anon";

grant references on table "public"."study_streaks" to "anon";

grant select on table "public"."study_streaks" to "anon";

grant trigger on table "public"."study_streaks" to "anon";

grant truncate on table "public"."study_streaks" to "anon";

grant update on table "public"."study_streaks" to "anon";

grant delete on table "public"."study_streaks" to "authenticated";

grant insert on table "public"."study_streaks" to "authenticated";

grant references on table "public"."study_streaks" to "authenticated";

grant select on table "public"."study_streaks" to "authenticated";

grant trigger on table "public"."study_streaks" to "authenticated";

grant truncate on table "public"."study_streaks" to "authenticated";

grant update on table "public"."study_streaks" to "authenticated";

grant delete on table "public"."study_streaks" to "service_role";

grant insert on table "public"."study_streaks" to "service_role";

grant references on table "public"."study_streaks" to "service_role";

grant select on table "public"."study_streaks" to "service_role";

grant trigger on table "public"."study_streaks" to "service_role";

grant truncate on table "public"."study_streaks" to "service_role";

grant update on table "public"."study_streaks" to "service_role";

grant delete on table "public"."system_settings" to "anon";

grant insert on table "public"."system_settings" to "anon";

grant references on table "public"."system_settings" to "anon";

grant select on table "public"."system_settings" to "anon";

grant trigger on table "public"."system_settings" to "anon";

grant truncate on table "public"."system_settings" to "anon";

grant update on table "public"."system_settings" to "anon";

grant delete on table "public"."system_settings" to "authenticated";

grant insert on table "public"."system_settings" to "authenticated";

grant references on table "public"."system_settings" to "authenticated";

grant select on table "public"."system_settings" to "authenticated";

grant trigger on table "public"."system_settings" to "authenticated";

grant truncate on table "public"."system_settings" to "authenticated";

grant update on table "public"."system_settings" to "authenticated";

grant delete on table "public"."system_settings" to "service_role";

grant insert on table "public"."system_settings" to "service_role";

grant references on table "public"."system_settings" to "service_role";

grant select on table "public"."system_settings" to "service_role";

grant trigger on table "public"."system_settings" to "service_role";

grant truncate on table "public"."system_settings" to "service_role";

grant update on table "public"."system_settings" to "service_role";

grant delete on table "public"."topics" to "anon";

grant insert on table "public"."topics" to "anon";

grant references on table "public"."topics" to "anon";

grant select on table "public"."topics" to "anon";

grant trigger on table "public"."topics" to "anon";

grant truncate on table "public"."topics" to "anon";

grant update on table "public"."topics" to "anon";

grant delete on table "public"."topics" to "authenticated";

grant insert on table "public"."topics" to "authenticated";

grant references on table "public"."topics" to "authenticated";

grant select on table "public"."topics" to "authenticated";

grant trigger on table "public"."topics" to "authenticated";

grant truncate on table "public"."topics" to "authenticated";

grant update on table "public"."topics" to "authenticated";

grant delete on table "public"."topics" to "service_role";

grant insert on table "public"."topics" to "service_role";

grant references on table "public"."topics" to "service_role";

grant select on table "public"."topics" to "service_role";

grant trigger on table "public"."topics" to "service_role";

grant truncate on table "public"."topics" to "service_role";

grant update on table "public"."topics" to "service_role";

grant delete on table "public"."user_badges" to "anon";

grant insert on table "public"."user_badges" to "anon";

grant references on table "public"."user_badges" to "anon";

grant select on table "public"."user_badges" to "anon";

grant trigger on table "public"."user_badges" to "anon";

grant truncate on table "public"."user_badges" to "anon";

grant update on table "public"."user_badges" to "anon";

grant delete on table "public"."user_badges" to "authenticated";

grant insert on table "public"."user_badges" to "authenticated";

grant references on table "public"."user_badges" to "authenticated";

grant select on table "public"."user_badges" to "authenticated";

grant trigger on table "public"."user_badges" to "authenticated";

grant truncate on table "public"."user_badges" to "authenticated";

grant update on table "public"."user_badges" to "authenticated";

grant delete on table "public"."user_badges" to "service_role";

grant insert on table "public"."user_badges" to "service_role";

grant references on table "public"."user_badges" to "service_role";

grant select on table "public"."user_badges" to "service_role";

grant trigger on table "public"."user_badges" to "service_role";

grant truncate on table "public"."user_badges" to "service_role";

grant update on table "public"."user_badges" to "service_role";

grant delete on table "public"."votes" to "anon";

grant insert on table "public"."votes" to "anon";

grant references on table "public"."votes" to "anon";

grant select on table "public"."votes" to "anon";

grant trigger on table "public"."votes" to "anon";

grant truncate on table "public"."votes" to "anon";

grant update on table "public"."votes" to "anon";

grant delete on table "public"."votes" to "authenticated";

grant insert on table "public"."votes" to "authenticated";

grant references on table "public"."votes" to "authenticated";

grant select on table "public"."votes" to "authenticated";

grant trigger on table "public"."votes" to "authenticated";

grant truncate on table "public"."votes" to "authenticated";

grant update on table "public"."votes" to "authenticated";

grant delete on table "public"."votes" to "service_role";

grant insert on table "public"."votes" to "service_role";

grant references on table "public"."votes" to "service_role";

grant select on table "public"."votes" to "service_role";

grant trigger on table "public"."votes" to "service_role";

grant truncate on table "public"."votes" to "service_role";

grant update on table "public"."votes" to "service_role";

grant delete on table "public"."weekly_challenges" to "anon";

grant insert on table "public"."weekly_challenges" to "anon";

grant references on table "public"."weekly_challenges" to "anon";

grant select on table "public"."weekly_challenges" to "anon";

grant trigger on table "public"."weekly_challenges" to "anon";

grant truncate on table "public"."weekly_challenges" to "anon";

grant update on table "public"."weekly_challenges" to "anon";

grant delete on table "public"."weekly_challenges" to "authenticated";

grant insert on table "public"."weekly_challenges" to "authenticated";

grant references on table "public"."weekly_challenges" to "authenticated";

grant select on table "public"."weekly_challenges" to "authenticated";

grant trigger on table "public"."weekly_challenges" to "authenticated";

grant truncate on table "public"."weekly_challenges" to "authenticated";

grant update on table "public"."weekly_challenges" to "authenticated";

grant delete on table "public"."weekly_challenges" to "service_role";

grant insert on table "public"."weekly_challenges" to "service_role";

grant references on table "public"."weekly_challenges" to "service_role";

grant select on table "public"."weekly_challenges" to "service_role";

grant trigger on table "public"."weekly_challenges" to "service_role";

grant truncate on table "public"."weekly_challenges" to "service_role";

grant update on table "public"."weekly_challenges" to "service_role";


  create policy "Users can manage their own views"
  on "public"."announcement_views"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "Users manage their announcement views"
  on "public"."announcement_views"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Admins manage announcements"
  on "public"."announcements"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Announcements readable"
  on "public"."announcements"
  as permissive
  for select
  to public
using (((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now()))));



  create policy "Anyone can view active announcements"
  on "public"."announcements"
  as permissive
  for select
  to public
using (((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now()))));



  create policy "Admins manage badges"
  on "public"."badges"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Allow read access to all badges"
  on "public"."badges"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete their own bookmarks"
  on "public"."bookmarks"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert their own bookmarks"
  on "public"."bookmarks"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can read their own bookmarks"
  on "public"."bookmarks"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can create their own challenge attempts"
  on "public"."challenge_attempts"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view all challenge attempts"
  on "public"."challenge_attempts"
  as permissive
  for select
  to public
using (true);



  create policy "Users manage own collection items"
  on "public"."collection_items"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.collections c
  WHERE ((c.id = collection_items.collection_id) AND (c.user_id = auth.uid())))));



  create policy "collection_items_own"
  on "public"."collection_items"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.collections c
  WHERE ((c.id = collection_items.collection_id) AND (c.user_id = auth.uid())))));



  create policy "Users can add questions to their own collections"
  on "public"."collection_questions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.question_collections
  WHERE ((question_collections.id = collection_questions.collection_id) AND (question_collections.user_id = auth.uid())))));



  create policy "Users can remove questions from their own collections"
  on "public"."collection_questions"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.question_collections
  WHERE ((question_collections.id = collection_questions.collection_id) AND (question_collections.user_id = auth.uid())))));



  create policy "Users can view collection questions for accessible collections"
  on "public"."collection_questions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.question_collections
  WHERE ((question_collections.id = collection_questions.collection_id) AND ((question_collections.user_id = auth.uid()) OR (question_collections.is_public = true))))));



  create policy "Users manage own collections"
  on "public"."collections"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users read own collections"
  on "public"."collections"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "collections_own"
  on "public"."collections"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Admins manage comments"
  on "public"."comments"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Comments readable by all"
  on "public"."comments"
  as permissive
  for select
  to public
using (true);



  create policy "Users delete own comments"
  on "public"."comments"
  as permissive
  for delete
  to public
using ((auth.uid() = author_id));



  create policy "Users insert own comments"
  on "public"."comments"
  as permissive
  for insert
  to public
with check ((auth.uid() = author_id));



  create policy "Users update own comments"
  on "public"."comments"
  as permissive
  for update
  to public
using ((auth.uid() = author_id));



  create policy "Anyone can view public exams"
  on "public"."community_exams"
  as permissive
  for select
  to public
using (((is_public = true) OR (created_by = auth.uid())));



  create policy "Authenticated users can create exams"
  on "public"."community_exams"
  as permissive
  for insert
  to public
with check ((auth.uid() = created_by));



  create policy "Users can delete their own exams"
  on "public"."community_exams"
  as permissive
  for delete
  to public
using ((auth.uid() = created_by));



  create policy "Users can update their own exams"
  on "public"."community_exams"
  as permissive
  for update
  to public
using ((auth.uid() = created_by));



  create policy "Users manage their daily activities"
  on "public"."daily_activities"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "edit_suggestions_delete"
  on "public"."edit_suggestions"
  as permissive
  for delete
  to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role])))))));



  create policy "edit_suggestions_insert"
  on "public"."edit_suggestions"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "edit_suggestions_select"
  on "public"."edit_suggestions"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))) OR (user_id = auth.uid())));



  create policy "edit_suggestions_update_admin"
  on "public"."edit_suggestions"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Users insert own history"
  on "public"."exam_history"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users read their own exam history"
  on "public"."exam_history"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "exam_history_own"
  on "public"."exam_history"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Anyone can view ratings"
  on "public"."exam_ratings"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can rate exams"
  on "public"."exam_ratings"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own ratings"
  on "public"."exam_ratings"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Admins manage exams"
  on "public"."exams"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Exams readable"
  on "public"."exams"
  as permissive
  for select
  to public
using (((is_public = true) OR (author_id = auth.uid())));



  create policy "Users create exams"
  on "public"."exams"
  as permissive
  for insert
  to public
with check ((auth.uid() = author_id));



  create policy "Users update own exams"
  on "public"."exams"
  as permissive
  for update
  to public
using ((auth.uid() = author_id));



  create policy "exams_manage_own"
  on "public"."exams"
  as permissive
  for all
  to public
using ((author_id = auth.uid()));



  create policy "exams_select_public"
  on "public"."exams"
  as permissive
  for select
  to public
using (((is_public = true) OR (author_id = auth.uid())));



  create policy "Users can insert their own notification preferences"
  on "public"."notification_preferences"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own notification preferences"
  on "public"."notification_preferences"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own notification preferences"
  on "public"."notification_preferences"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins send notifications to anyone"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Users insert own notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users select own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "No one deletes profiles"
  on "public"."profiles"
  as permissive
  for delete
  to public
using (false);



  create policy "Public profiles readable"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users manage own attempts"
  on "public"."question_attempts"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can create their own collections"
  on "public"."question_collections"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can delete their own collections"
  on "public"."question_collections"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can update their own collections"
  on "public"."question_collections"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own collections"
  on "public"."question_collections"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR (is_public = true)));



  create policy "Admins can read all imports"
  on "public"."question_imports"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Users can create own imports"
  on "public"."question_imports"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Users can delete own imports"
  on "public"."question_imports"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can read own imports"
  on "public"."question_imports"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can update own imports"
  on "public"."question_imports"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users manage own views"
  on "public"."question_views"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users record own views"
  on "public"."question_views"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Admins manage questions"
  on "public"."questions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Questions readable"
  on "public"."questions"
  as permissive
  for select
  to public
using (true);



  create policy "Users insert own questions"
  on "public"."questions"
  as permissive
  for insert
  to public
with check ((auth.uid() = author_id));



  create policy "Users update own questions"
  on "public"."questions"
  as permissive
  for update
  to public
using ((auth.uid() = author_id));



  create policy "Admins can update reports"
  on "public"."reports"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Reports readable by admins"
  on "public"."reports"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Users create reports"
  on "public"."reports"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users manage their streaks"
  on "public"."study_streaks"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Admins manage topics"
  on "public"."topics"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Topics readable by everyone"
  on "public"."topics"
  as permissive
  for select
  to public
using (true);



  create policy "Topics readable"
  on "public"."topics"
  as permissive
  for select
  to public
using (true);



  create policy "Users insert own votes"
  on "public"."votes"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users update own votes"
  on "public"."votes"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Votes readable"
  on "public"."votes"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage challenges"
  on "public"."weekly_challenges"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Admins manage weekly challenges"
  on "public"."weekly_challenges"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'super_admin'::public.user_role]))))));



  create policy "Everyone can view active challenges"
  on "public"."weekly_challenges"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Weekly challenges readable"
  on "public"."weekly_challenges"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER trg_sync_topic_question_count AFTER INSERT OR DELETE OR UPDATE OF status, topic_id ON public.questions FOR EACH ROW EXECUTE FUNCTION public.sync_topic_question_count();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();


  create policy "Users can read own import files"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'question-imports'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload own import files"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'question-imports'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



