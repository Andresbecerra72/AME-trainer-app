-- ==========================================
-- FINAL_SEED.SQL
-- Seeds iniciales para AME Exam Trainer App
-- ==========================================


-- ==========================================
-- 1. CREAR SUPER ADMIN
-- ==========================================

-- ⚠️ Antes de ejecutar, asegúrate de que exista un usuario en auth.users con este email
--    Puedes cambiar el correo por el tuyo

update profiles
set role = 'super_admin',
    display_name = 'System Administrator'
where email = 'andresbecerra7200@gmail.com';


-- ==========================================
-- 2. TOPICS INICIALES
-- ==========================================

insert into topics (id, title, description)
values
(gen_random_uuid(), 'Electrical Systems', 'Study of aircraft electrical systems and components'),
(gen_random_uuid(), 'Hydraulics', 'Basic and advanced hydraulic systems'),
(gen_random_uuid(), 'Fuel Systems', 'Fuel pumps, tanks and lines in aircraft'),
(gen_random_uuid(), 'Flight Controls', 'Primary and secondary aircraft control systems'),
(gen_random_uuid(), 'Engines', 'Piston, turbine, and jet engines overview'),
(gen_random_uuid(), 'Safety Procedures', 'Aircraft safety procedures and PPE')
on conflict do nothing;


-- ==========================================
-- 3. BADGES
-- ==========================================

insert into badges (id, name, description, icon)
values
(gen_random_uuid(), 'First Steps', 'Completed your first question', 'star'),
(gen_random_uuid(), 'Dedicated Learner', 'Completed 50 questions', 'award'),
(gen_random_uuid(), 'Top Performer', 'Scored above 90% in an exam', 'trophy'),
(gen_random_uuid(), 'Community Helper', 'Submitted 10 approved questions', 'handshake')
on conflict do nothing;


-- ==========================================
-- 4. WEEKLY CHALLENGES
-- ==========================================

insert into weekly_challenges (id, week_start, challenge_type, required_count, reward_badge)
values
(gen_random_uuid(), current_date, 'answer_questions', 20, null),
(gen_random_uuid(), current_date, 'create_questions', 5, null),
(gen_random_uuid(), current_date, 'complete_exams', 1, null);


-- ==========================================
-- 5. SYSTEM SETTINGS
-- ==========================================

insert into system_settings (id, key, value)
values
(gen_random_uuid(), 'exam.pass_percentage', '70'),
(gen_random_uuid(), 'questions.max_daily_submissions', '25'),
(gen_random_uuid(), 'notifications.enabled', 'true')
on conflict (key) do update set value = excluded.value;


-- ==========================================
-- 6. SYSTEM ANNOUNCEMENT
-- ==========================================

insert into announcements (id, title, message, type, created_by)
values (
  gen_random_uuid(),
  'Welcome to AME Exam Trainer!',
  'Start practicing questions, challenge yourself with exams, and join the mechanic community!',
  'info',
  (select id from profiles where role = 'super_admin' limit 1)
)
on conflict do nothing;


-- ==========================================
-- 7. SAMPLE QUESTIONS (optional for testing)
-- ==========================================

insert into questions (
  id, topic_id, author_id, content, answer_options, correct_answer, status
)
values
(
  gen_random_uuid(),
  (select id from topics where title = 'Electrical Systems' limit 1),
  (select id from profiles where role = 'super_admin' limit 1),
  'What is the main function of an aircraft generator?',
  ARRAY['Produce AC power', 'Store electrical energy', 'Regulate voltage', 'Measure current'],
  0,
  'approved'
),
(
  gen_random_uuid(),
  (select id from topics where title = 'Flight Controls' limit 1),
  (select id from profiles where role = 'super_admin' limit 1),
  'Which control surface primarily controls pitch?',
  ARRAY['Ailerons', 'Elevators', 'Rudder', 'Flaps'],
  1,
  'approved'
);


-- ==========================================
-- 8. INITIAL COLLECTION FOR SUPER ADMIN
-- ==========================================

insert into collections (id, user_id, name)
values (
  gen_random_uuid(),
  (select id from profiles where role = 'super_admin' limit 1),
  'Starter Collection'
)
on conflict do nothing;


-- ==========================================
-- 9. INITIAL NOTIFICATION PREFERENCES
-- ==========================================

insert into notification_preferences (id, user_id)
select gen_random_uuid(), id
from profiles
on conflict (user_id) do nothing;


-- ==========================================
-- END OF FINAL_SEED.SQL
-- ==========================================
