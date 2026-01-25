


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."notification_type" AS ENUM (
    'upvote',
    'comment',
    'answer',
    'mention',
    'badge',
    'moderation',
    'question_approved',
    'question_rejected'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."question_difficulty" AS ENUM (
    'easy',
    'medium',
    'hard'
);


ALTER TYPE "public"."question_difficulty" OWNER TO "postgres";


CREATE TYPE "public"."question_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'flagged'
);


ALTER TYPE "public"."question_status" OWNER TO "postgres";


CREATE TYPE "public"."report_status" AS ENUM (
    'pending',
    'reviewed',
    'resolved',
    'dismissed'
);


ALTER TYPE "public"."report_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin',
    'super_admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, null, 'user');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_topic_question_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."sync_topic_question_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_question_comments_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions
    SET comments_count = comments_count + 1
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_question_comments_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quick_actions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_quick_actions_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."announcement_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "announcement_id" "uuid",
    "user_id" "uuid",
    "viewed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."announcement_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    CONSTRAINT "announcements_type_check" CHECK (("type" = ANY (ARRAY['info'::"text", 'warning'::"text", 'success'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "requirement" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "color" "text",
    "criteria" "text"
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookmarks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bookmarks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."challenge_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "challenge_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "total_questions" integer NOT NULL,
    "time_taken" integer NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."challenge_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collection_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid",
    "question_id" "uuid"
);


ALTER TABLE "public"."collection_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collection_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collection_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "author_id" "uuid",
    "content" "text" NOT NULL,
    "upvotes" integer DEFAULT 0,
    "is_edited" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_exams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "topic_ids" "uuid"[] NOT NULL,
    "question_count" integer NOT NULL,
    "time_limit" integer,
    "difficulty" "text",
    "is_public" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "rating_average" numeric(3,2) DEFAULT 0,
    "rating_count" integer DEFAULT 0,
    "taken_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "community_exams_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text", 'mixed'::"text"])))
);


ALTER TABLE "public"."community_exams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_activities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "activity_date" "date" NOT NULL,
    "questions_answered" integer DEFAULT 0,
    "exams_taken" integer DEFAULT 0,
    "questions_contributed" integer DEFAULT 0,
    "comments_made" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."daily_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."edit_suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "proposed_question_text" "text",
    "proposed_answers" "jsonb",
    "proposed_correct_index" "text",
    "reason" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewer_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "edit_suggestions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."edit_suggestions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exam_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "topic_ids" "uuid"[],
    "question_count" integer NOT NULL,
    "correct_answers" integer NOT NULL,
    "incorrect_answers" integer NOT NULL,
    "score_percentage" numeric(5,2) NOT NULL,
    "time_taken" integer,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "community_exam_id" "uuid"
);


ALTER TABLE "public"."exam_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exam_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exam_id" "uuid",
    "question_id" "uuid"
);


ALTER TABLE "public"."exam_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exam_ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "exam_id" "uuid",
    "user_id" "uuid",
    "rating" integer NOT NULL,
    "review" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "exam_ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."exam_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "author_id" "uuid",
    "is_public" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "user_id" "uuid" NOT NULL,
    "email_notifications" boolean DEFAULT true,
    "push_notifications" boolean DEFAULT true,
    "notify_on_comment" boolean DEFAULT true,
    "notify_on_vote" boolean DEFAULT true,
    "notify_on_answer" boolean DEFAULT false,
    "notify_on_edit_suggestion" boolean DEFAULT true,
    "notify_on_question_approved" boolean DEFAULT true,
    "notify_on_report_resolved" boolean DEFAULT true,
    "notify_on_badge_earned" boolean DEFAULT true,
    "notify_on_streak_milestone" boolean DEFAULT true,
    "notify_weekly_digest" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "type" "public"."notification_type" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role",
    "reputation" integer DEFAULT 0,
    "questions_contributed" integer DEFAULT 0,
    "answers_contributed" integer DEFAULT 0,
    "upvotes_received" integer DEFAULT 0,
    "is_verified" boolean DEFAULT false,
    "is_banned" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "full_name" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "question_id" "uuid",
    "selected_option" "text",
    "is_correct" boolean,
    "attempted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."question_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."question_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_imports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text",
    "file_mime" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "raw_text" "text",
    "result" "jsonb",
    "stats" "jsonb",
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "raw_pages" "jsonb",
    CONSTRAINT "question_imports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'ready'::"text", 'failed'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."question_imports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_of_day" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."question_of_day" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "question_id" "uuid",
    "viewed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."question_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "topic_id" "uuid",
    "author_id" "uuid",
    "question_text" "text" NOT NULL,
    "option_a" "text" NOT NULL,
    "option_b" "text" NOT NULL,
    "option_c" "text" NOT NULL,
    "option_d" "text" NOT NULL,
    "correct_answer" character(1) NOT NULL,
    "explanation" "text",
    "difficulty" "public"."question_difficulty" DEFAULT 'medium'::"public"."question_difficulty",
    "status" "public"."question_status" DEFAULT 'pending'::"public"."question_status",
    "upvotes" integer DEFAULT 0,
    "downvotes" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "report_count" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "rejection_reason" "text",
    "comments_count" integer DEFAULT 0,
    "views_count" integer DEFAULT 0,
    CONSTRAINT "questions_correct_answer_check" CHECK (("correct_answer" = ANY (ARRAY['A'::"bpchar", 'B'::"bpchar", 'C'::"bpchar", 'D'::"bpchar"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quick_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(100) NOT NULL,
    "description" "text" NOT NULL,
    "icon" character varying(50) NOT NULL,
    "color" character varying(50) NOT NULL,
    "bg_color" character varying(100) NOT NULL,
    "path" character varying(255) NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quick_actions" OWNER TO "postgres";


COMMENT ON TABLE "public"."quick_actions" IS 'Stores all available quick action cards in the dashboard';



CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reporter_id" "uuid",
    "question_id" "uuid",
    "comment_id" "uuid",
    "reason" "text" NOT NULL,
    "description" "text",
    "status" "public"."report_status" DEFAULT 'pending'::"public"."report_status",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "resolution_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    CONSTRAINT "reports_check" CHECK (((("question_id" IS NOT NULL) AND ("comment_id" IS NULL)) OR (("question_id" IS NULL) AND ("comment_id" IS NOT NULL))))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_quick_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "quick_action_id" "uuid" NOT NULL,
    "is_hidden" boolean DEFAULT false,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_quick_actions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_quick_actions" IS 'Controls visibility and order of quick actions per role';



COMMENT ON COLUMN "public"."role_quick_actions"."is_hidden" IS 'When true, the action is hidden for this role';



COMMENT ON COLUMN "public"."role_quick_actions"."display_order" IS 'Order in which actions appear for this role';



CREATE TABLE IF NOT EXISTS "public"."saved_exams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "exam_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_exams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_streaks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "current_streak" integer DEFAULT 0,
    "longest_streak" integer DEFAULT 0,
    "last_activity_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."study_streaks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "description" "text",
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "question_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "code" "text"
);


ALTER TABLE "public"."topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "badge_id" "uuid",
    "earned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "question_id" "uuid",
    "comment_id" "uuid",
    "vote_type" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "votes_check" CHECK (((("question_id" IS NOT NULL) AND ("comment_id" IS NULL)) OR (("question_id" IS NULL) AND ("comment_id" IS NOT NULL)))),
    CONSTRAINT "votes_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['-1'::integer, 1])))
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weekly_challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "topic_id" "uuid",
    "question_count" integer DEFAULT 20 NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."weekly_challenges" OWNER TO "postgres";


ALTER TABLE ONLY "public"."announcement_views"
    ADD CONSTRAINT "announcement_views_announcement_id_user_id_key" UNIQUE ("announcement_id", "user_id");



ALTER TABLE ONLY "public"."announcement_views"
    ADD CONSTRAINT "announcement_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_user_id_question_id_key" UNIQUE ("user_id", "question_id");



ALTER TABLE ONLY "public"."challenge_attempts"
    ADD CONSTRAINT "challenge_attempts_challenge_id_user_id_key" UNIQUE ("challenge_id", "user_id");



ALTER TABLE ONLY "public"."challenge_attempts"
    ADD CONSTRAINT "challenge_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collection_items"
    ADD CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collection_questions"
    ADD CONSTRAINT "collection_questions_collection_id_question_id_key" UNIQUE ("collection_id", "question_id");



ALTER TABLE ONLY "public"."collection_questions"
    ADD CONSTRAINT "collection_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_exams"
    ADD CONSTRAINT "community_exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_activities"
    ADD CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_activities"
    ADD CONSTRAINT "daily_activities_user_id_activity_date_key" UNIQUE ("user_id", "activity_date");



ALTER TABLE ONLY "public"."edit_suggestions"
    ADD CONSTRAINT "edit_suggestions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_history"
    ADD CONSTRAINT "exam_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_questions"
    ADD CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_ratings"
    ADD CONSTRAINT "exam_ratings_exam_id_user_id_key" UNIQUE ("exam_id", "user_id");



ALTER TABLE ONLY "public"."exam_ratings"
    ADD CONSTRAINT "exam_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_user_id_question_id_key" UNIQUE ("user_id", "question_id");



ALTER TABLE ONLY "public"."question_collections"
    ADD CONSTRAINT "question_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_imports"
    ADD CONSTRAINT "question_imports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_of_day"
    ADD CONSTRAINT "question_of_day_date_key" UNIQUE ("date");



ALTER TABLE ONLY "public"."question_of_day"
    ADD CONSTRAINT "question_of_day_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_views"
    ADD CONSTRAINT "question_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_actions"
    ADD CONSTRAINT "quick_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_quick_actions"
    ADD CONSTRAINT "role_quick_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_quick_actions"
    ADD CONSTRAINT "role_quick_actions_role_quick_action_id_key" UNIQUE ("role", "quick_action_id");



ALTER TABLE ONLY "public"."saved_exams"
    ADD CONSTRAINT "saved_exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_exams"
    ADD CONSTRAINT "saved_exams_user_id_exam_id_key" UNIQUE ("user_id", "exam_id");



ALTER TABLE ONLY "public"."study_streaks"
    ADD CONSTRAINT "study_streaks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_streaks"
    ADD CONSTRAINT "study_streaks_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_code_unique" UNIQUE ("code");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_badge_id_key" UNIQUE ("user_id", "badge_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_comment_id_key" UNIQUE ("user_id", "comment_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_question_id_key" UNIQUE ("user_id", "question_id");



ALTER TABLE ONLY "public"."weekly_challenges"
    ADD CONSTRAINT "weekly_challenges_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_announcement_views_user" ON "public"."announcement_views" USING "btree" ("user_id");



CREATE INDEX "idx_announcements_active" ON "public"."announcements" USING "btree" ("is_active", "expires_at");



CREATE INDEX "idx_challenge_attempts_challenge" ON "public"."challenge_attempts" USING "btree" ("challenge_id");



CREATE INDEX "idx_challenge_attempts_user" ON "public"."challenge_attempts" USING "btree" ("user_id");



CREATE INDEX "idx_challenge_dates" ON "public"."weekly_challenges" USING "btree" ("start_date", "end_date") WHERE ("is_active" = true);



CREATE INDEX "idx_collection_questions_collection" ON "public"."collection_questions" USING "btree" ("collection_id");



CREATE INDEX "idx_collection_questions_question" ON "public"."collection_questions" USING "btree" ("question_id");



CREATE INDEX "idx_collection_user" ON "public"."question_collections" USING "btree" ("user_id");



CREATE INDEX "idx_comments_author" ON "public"."comments" USING "btree" ("author_id");



CREATE INDEX "idx_comments_question" ON "public"."comments" USING "btree" ("question_id");



CREATE INDEX "idx_community_exams_created_by" ON "public"."community_exams" USING "btree" ("created_by");



CREATE INDEX "idx_community_exams_is_featured" ON "public"."community_exams" USING "btree" ("is_featured");



CREATE INDEX "idx_community_exams_is_public" ON "public"."community_exams" USING "btree" ("is_public");



CREATE INDEX "idx_daily_activities_user_date" ON "public"."daily_activities" USING "btree" ("user_id", "activity_date");



CREATE INDEX "idx_exam_history_community_exam" ON "public"."exam_history" USING "btree" ("community_exam_id");



CREATE INDEX "idx_exam_history_user" ON "public"."exam_history" USING "btree" ("user_id");



CREATE INDEX "idx_exam_ratings_exam" ON "public"."exam_ratings" USING "btree" ("exam_id");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_question_imports_has_pages" ON "public"."question_imports" USING "btree" ((("raw_pages" IS NOT NULL)));



CREATE INDEX "idx_question_imports_status" ON "public"."question_imports" USING "btree" ("status");



CREATE INDEX "idx_question_imports_user" ON "public"."question_imports" USING "btree" ("user_id");



CREATE INDEX "idx_question_of_day_date" ON "public"."question_of_day" USING "btree" ("date");



CREATE INDEX "idx_questions_author" ON "public"."questions" USING "btree" ("author_id");



CREATE INDEX "idx_questions_author_id" ON "public"."questions" USING "btree" ("author_id");



CREATE INDEX "idx_questions_created_at_id" ON "public"."questions" USING "btree" ("created_at" DESC, "id" DESC);



COMMENT ON INDEX "public"."idx_questions_created_at_id" IS 'Primary index for cursor-based pagination. Essential for keyset pagination performance.';



CREATE INDEX "idx_questions_difficulty" ON "public"."questions" USING "btree" ("difficulty");



CREATE INDEX "idx_questions_status" ON "public"."questions" USING "btree" ("status");



CREATE INDEX "idx_questions_status_difficulty_created" ON "public"."questions" USING "btree" ("status", "difficulty", "created_at" DESC, "id" DESC);



CREATE INDEX "idx_questions_status_topic_created" ON "public"."questions" USING "btree" ("status", "topic_id", "created_at" DESC, "id" DESC);



COMMENT ON INDEX "public"."idx_questions_status_topic_created" IS 'Optimizes common query pattern: filtering by status and topic while paginating.';



CREATE INDEX "idx_questions_text_search" ON "public"."questions" USING "gin" ("to_tsvector"('"english"'::"regconfig", "question_text"));



CREATE INDEX "idx_questions_topic" ON "public"."questions" USING "btree" ("topic_id");



CREATE INDEX "idx_questions_topic_id" ON "public"."questions" USING "btree" ("topic_id");



CREATE INDEX "idx_quick_actions_active" ON "public"."quick_actions" USING "btree" ("is_active");



CREATE INDEX "idx_quick_actions_order" ON "public"."quick_actions" USING "btree" ("display_order");



CREATE INDEX "idx_reports_status" ON "public"."reports" USING "btree" ("status");



CREATE INDEX "idx_role_quick_actions_hidden" ON "public"."role_quick_actions" USING "btree" ("is_hidden");



CREATE INDEX "idx_role_quick_actions_role" ON "public"."role_quick_actions" USING "btree" ("role");



CREATE INDEX "idx_saved_exams_user" ON "public"."saved_exams" USING "btree" ("user_id");



CREATE INDEX "idx_study_streaks_user" ON "public"."study_streaks" USING "btree" ("user_id");



CREATE INDEX "idx_votes_question" ON "public"."votes" USING "btree" ("question_id");



CREATE INDEX "idx_votes_user" ON "public"."votes" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "decrement_comments_count" AFTER DELETE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_question_comments_count"();



CREATE OR REPLACE TRIGGER "increment_comments_count" AFTER INSERT ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_question_comments_count"();



CREATE OR REPLACE TRIGGER "quick_actions_updated_at" BEFORE UPDATE ON "public"."quick_actions" FOR EACH ROW EXECUTE FUNCTION "public"."update_quick_actions_updated_at"();



CREATE OR REPLACE TRIGGER "role_quick_actions_updated_at" BEFORE UPDATE ON "public"."role_quick_actions" FOR EACH ROW EXECUTE FUNCTION "public"."update_quick_actions_updated_at"();



CREATE OR REPLACE TRIGGER "trg_sync_topic_question_count" AFTER INSERT OR DELETE OR UPDATE OF "status", "topic_id" ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_topic_question_count"();



ALTER TABLE ONLY "public"."announcement_views"
    ADD CONSTRAINT "announcement_views_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."challenge_attempts"
    ADD CONSTRAINT "challenge_attempts_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."weekly_challenges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."challenge_attempts"
    ADD CONSTRAINT "challenge_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_items"
    ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_items"
    ADD CONSTRAINT "collection_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_questions"
    ADD CONSTRAINT "collection_questions_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."question_collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_questions"
    ADD CONSTRAINT "collection_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."edit_suggestions"
    ADD CONSTRAINT "edit_suggestions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."edit_suggestions"
    ADD CONSTRAINT "edit_suggestions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."edit_suggestions"
    ADD CONSTRAINT "edit_suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_history"
    ADD CONSTRAINT "exam_history_community_exam_id_fkey" FOREIGN KEY ("community_exam_id") REFERENCES "public"."community_exams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."exam_history"
    ADD CONSTRAINT "exam_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_questions"
    ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_questions"
    ADD CONSTRAINT "exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_ratings"
    ADD CONSTRAINT "exam_ratings_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."community_exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_collections"
    ADD CONSTRAINT "question_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_imports"
    ADD CONSTRAINT "question_imports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_of_day"
    ADD CONSTRAINT "question_of_day_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_views"
    ADD CONSTRAINT "question_views_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_views"
    ADD CONSTRAINT "question_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."role_quick_actions"
    ADD CONSTRAINT "role_quick_actions_quick_action_id_fkey" FOREIGN KEY ("quick_action_id") REFERENCES "public"."quick_actions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_exams"
    ADD CONSTRAINT "saved_exams_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."community_exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weekly_challenges"
    ADD CONSTRAINT "weekly_challenges_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id");



CREATE POLICY "Admins can manage challenges" ON "public"."weekly_challenges" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins can read all imports" ON "public"."question_imports" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins can update reports" ON "public"."reports" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage announcements" ON "public"."announcements" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage badges" ON "public"."badges" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage comments" ON "public"."comments" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage exams" ON "public"."exams" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage questions" ON "public"."questions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage topics" ON "public"."topics" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins manage weekly challenges" ON "public"."weekly_challenges" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins send notifications to anyone" ON "public"."notifications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Allow read access to all badges" ON "public"."badges" FOR SELECT USING (true);



CREATE POLICY "Announcements readable" ON "public"."announcements" FOR SELECT USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "Anyone can view active announcements" ON "public"."announcements" FOR SELECT USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "Anyone can view active quick actions" ON "public"."quick_actions" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view public exams" ON "public"."community_exams" FOR SELECT USING ((("is_public" = true) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Anyone can view ratings" ON "public"."exam_ratings" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create exams" ON "public"."community_exams" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Authenticated users can rate exams" ON "public"."exam_ratings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Comments readable by all" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Everyone can view active challenges" ON "public"."weekly_challenges" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Exams readable" ON "public"."exams" FOR SELECT USING ((("is_public" = true) OR ("author_id" = "auth"."uid"())));



CREATE POLICY "No one deletes profiles" ON "public"."profiles" FOR DELETE USING (false);



CREATE POLICY "Public profiles readable" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Questions readable" ON "public"."questions" FOR SELECT USING (true);



CREATE POLICY "Reports readable by admins" ON "public"."reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Super admin can manage quick actions" ON "public"."quick_actions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "Super admin can manage role quick actions" ON "public"."role_quick_actions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "Topics readable" ON "public"."topics" FOR SELECT USING (true);



CREATE POLICY "Topics readable by everyone" ON "public"."topics" FOR SELECT USING (true);



CREATE POLICY "Users can add questions to their own collections" ON "public"."collection_questions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."question_collections"
  WHERE (("question_collections"."id" = "collection_questions"."collection_id") AND ("question_collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create own imports" ON "public"."question_imports" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own challenge attempts" ON "public"."challenge_attempts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own collections" ON "public"."question_collections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own imports" ON "public"."question_imports" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own bookmarks" ON "public"."bookmarks" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own collections" ON "public"."question_collections" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own exams" ON "public"."community_exams" FOR DELETE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can insert their own bookmarks" ON "public"."bookmarks" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own notification preferences" ON "public"."notification_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own views" ON "public"."announcement_views" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own imports" ON "public"."question_imports" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own bookmarks" ON "public"."bookmarks" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can remove questions from their own collections" ON "public"."collection_questions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."question_collections"
  WHERE (("question_collections"."id" = "collection_questions"."collection_id") AND ("question_collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own imports" ON "public"."question_imports" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own collections" ON "public"."question_collections" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own exams" ON "public"."community_exams" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their own notification preferences" ON "public"."notification_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own ratings" ON "public"."exam_ratings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view all challenge attempts" ON "public"."challenge_attempts" FOR SELECT USING (true);



CREATE POLICY "Users can view collection questions for accessible collections" ON "public"."collection_questions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."question_collections"
  WHERE (("question_collections"."id" = "collection_questions"."collection_id") AND (("question_collections"."user_id" = "auth"."uid"()) OR ("question_collections"."is_public" = true))))));



CREATE POLICY "Users can view their own collections" ON "public"."question_collections" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("is_public" = true)));



CREATE POLICY "Users can view their own notification preferences" ON "public"."notification_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their role quick actions" ON "public"."role_quick_actions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = "role_quick_actions"."role")))));



CREATE POLICY "Users create exams" ON "public"."exams" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Users create reports" ON "public"."reports" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users delete own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users insert own comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Users insert own history" ON "public"."exam_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own notifications" ON "public"."notifications" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users insert own questions" ON "public"."questions" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Users insert own votes" ON "public"."votes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own attempts" ON "public"."question_attempts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own collection items" ON "public"."collection_items" USING ((EXISTS ( SELECT 1
   FROM "public"."collections" "c"
  WHERE (("c"."id" = "collection_items"."collection_id") AND ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users manage own collections" ON "public"."collections" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own views" ON "public"."question_views" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage their announcement views" ON "public"."announcement_views" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage their daily activities" ON "public"."daily_activities" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage their streaks" ON "public"."study_streaks" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own collections" ON "public"."collections" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read their own exam history" ON "public"."exam_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users record own views" ON "public"."question_views" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users select own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users update own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users update own exams" ON "public"."exams" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users update own questions" ON "public"."questions" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users update own votes" ON "public"."votes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Votes readable" ON "public"."votes" FOR SELECT USING (true);



CREATE POLICY "Weekly challenges readable" ON "public"."weekly_challenges" FOR SELECT USING (true);



ALTER TABLE "public"."announcement_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."challenge_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collection_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "collection_items_own" ON "public"."collection_items" USING ((EXISTS ( SELECT 1
   FROM "public"."collections" "c"
  WHERE (("c"."id" = "collection_items"."collection_id") AND ("c"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."collection_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "collections_own" ON "public"."collections" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_exams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."edit_suggestions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "edit_suggestions_delete" ON "public"."edit_suggestions" FOR DELETE USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])))))));



CREATE POLICY "edit_suggestions_insert" ON "public"."edit_suggestions" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "edit_suggestions_select" ON "public"."edit_suggestions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "edit_suggestions_update_admin" ON "public"."edit_suggestions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



ALTER TABLE "public"."exam_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exam_history_own" ON "public"."exam_history" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."exam_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exams_manage_own" ON "public"."exams" USING (("author_id" = "auth"."uid"()));



CREATE POLICY "exams_select_public" ON "public"."exams" FOR SELECT USING ((("is_public" = true) OR ("author_id" = "auth"."uid"())));



ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_imports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_of_day" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "question_of_day_admin_all" ON "public"."question_of_day" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "question_of_day_insert_authenticated" ON "public"."question_of_day" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "question_of_day_select_all" ON "public"."question_of_day" FOR SELECT USING (true);



ALTER TABLE "public"."question_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_quick_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_exams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_streaks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weekly_challenges" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_topic_question_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_topic_question_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_topic_question_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_question_comments_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_question_comments_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_question_comments_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quick_actions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_quick_actions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quick_actions_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."announcement_views" TO "anon";
GRANT ALL ON TABLE "public"."announcement_views" TO "authenticated";
GRANT ALL ON TABLE "public"."announcement_views" TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmarks" TO "service_role";



GRANT ALL ON TABLE "public"."challenge_attempts" TO "anon";
GRANT ALL ON TABLE "public"."challenge_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."challenge_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."collection_items" TO "anon";
GRANT ALL ON TABLE "public"."collection_items" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_items" TO "service_role";



GRANT ALL ON TABLE "public"."collection_questions" TO "anon";
GRANT ALL ON TABLE "public"."collection_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_questions" TO "service_role";



GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."community_exams" TO "anon";
GRANT ALL ON TABLE "public"."community_exams" TO "authenticated";
GRANT ALL ON TABLE "public"."community_exams" TO "service_role";



GRANT ALL ON TABLE "public"."daily_activities" TO "anon";
GRANT ALL ON TABLE "public"."daily_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_activities" TO "service_role";



GRANT ALL ON TABLE "public"."edit_suggestions" TO "anon";
GRANT ALL ON TABLE "public"."edit_suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."edit_suggestions" TO "service_role";



GRANT ALL ON TABLE "public"."exam_history" TO "anon";
GRANT ALL ON TABLE "public"."exam_history" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_history" TO "service_role";



GRANT ALL ON TABLE "public"."exam_questions" TO "anon";
GRANT ALL ON TABLE "public"."exam_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_questions" TO "service_role";



GRANT ALL ON TABLE "public"."exam_ratings" TO "anon";
GRANT ALL ON TABLE "public"."exam_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."exams" TO "anon";
GRANT ALL ON TABLE "public"."exams" TO "authenticated";
GRANT ALL ON TABLE "public"."exams" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."question_attempts" TO "anon";
GRANT ALL ON TABLE "public"."question_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."question_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."question_collections" TO "anon";
GRANT ALL ON TABLE "public"."question_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."question_collections" TO "service_role";



GRANT ALL ON TABLE "public"."question_imports" TO "anon";
GRANT ALL ON TABLE "public"."question_imports" TO "authenticated";
GRANT ALL ON TABLE "public"."question_imports" TO "service_role";



GRANT ALL ON TABLE "public"."question_of_day" TO "anon";
GRANT ALL ON TABLE "public"."question_of_day" TO "authenticated";
GRANT ALL ON TABLE "public"."question_of_day" TO "service_role";



GRANT ALL ON TABLE "public"."question_views" TO "anon";
GRANT ALL ON TABLE "public"."question_views" TO "authenticated";
GRANT ALL ON TABLE "public"."question_views" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."quick_actions" TO "anon";
GRANT ALL ON TABLE "public"."quick_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_actions" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."role_quick_actions" TO "anon";
GRANT ALL ON TABLE "public"."role_quick_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_quick_actions" TO "service_role";



GRANT ALL ON TABLE "public"."saved_exams" TO "anon";
GRANT ALL ON TABLE "public"."saved_exams" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_exams" TO "service_role";



GRANT ALL ON TABLE "public"."study_streaks" TO "anon";
GRANT ALL ON TABLE "public"."study_streaks" TO "authenticated";
GRANT ALL ON TABLE "public"."study_streaks" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON TABLE "public"."weekly_challenges" TO "anon";
GRANT ALL ON TABLE "public"."weekly_challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_challenges" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

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



