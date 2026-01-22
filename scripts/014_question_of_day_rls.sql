-- Add RLS policies for question_of_day table
-- This table should be readable by everyone and writable by the system (authenticated users)

-- Allow everyone to read question of the day
CREATE POLICY "question_of_day_select_all" 
ON public.question_of_day 
FOR SELECT 
USING (true);

-- Allow authenticated users (system) to insert question of the day
-- Only one question per day, so we use a generous insert policy
CREATE POLICY "question_of_day_insert_authenticated" 
ON public.question_of_day 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to manage question of the day
CREATE POLICY "question_of_day_admin_all" 
ON public.question_of_day 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);
