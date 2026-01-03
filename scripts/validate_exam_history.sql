-- Script de validación para exam_history
-- Ejecuta esto en Supabase SQL Editor para verificar que todo esté correcto

-- 1. Verificar que la tabla existe
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'exam_history';

-- 2. Verificar las columnas de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'exam_history'
ORDER BY ordinal_position;

-- 3. Verificar las políticas RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'exam_history';

-- 4. Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'exam_history';

-- 5. Ver los últimos 10 registros (si existen)
SELECT 
    id,
    user_id,
    array_length(topic_ids, 1) as num_topics,
    question_count,
    correct_answers,
    score_percentage,
    time_taken,
    completed_at
FROM exam_history
ORDER BY completed_at DESC
LIMIT 10;

-- 6. Estadísticas generales
SELECT 
    COUNT(*) as total_exams,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(score_percentage) as avg_score,
    MAX(score_percentage) as best_score,
    MIN(score_percentage) as lowest_score
FROM exam_history;
