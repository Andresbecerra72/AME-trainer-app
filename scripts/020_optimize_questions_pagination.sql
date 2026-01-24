-- Migration: Optimize Questions Table for Cursor-Based Pagination
-- 
-- This migration adds indexes required for high-performance cursor-based pagination
-- with filtering capabilities.
--
-- Run this migration via Supabase Dashboard or psql:
-- psql -h [host] -U postgres -d postgres -f 020_optimize_questions_pagination.sql

BEGIN;

-- 1. Primary composite index for cursor pagination
-- This is THE MOST IMPORTANT index for keyset pagination
-- Enables efficient sorting and filtering by created_at + id
DROP INDEX IF EXISTS idx_questions_created_at_id;
CREATE INDEX idx_questions_created_at_id 
ON questions(created_at DESC, id DESC);

-- 2. Index for topic filtering
DROP INDEX IF EXISTS idx_questions_topic_id;
CREATE INDEX idx_questions_topic_id ON questions(topic_id);

-- 3. Index for difficulty filtering
DROP INDEX IF EXISTS idx_questions_difficulty;
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- 4. Index for status filtering
DROP INDEX IF EXISTS idx_questions_status;
CREATE INDEX idx_questions_status ON questions(status);

-- 5. Index for author filtering
DROP INDEX IF EXISTS idx_questions_author_id;
CREATE INDEX idx_questions_author_id ON questions(author_id);

-- 6. Full-text search index on question text
-- Enables fast text search using PostgreSQL's built-in full-text search
DROP INDEX IF EXISTS idx_questions_text_search;
CREATE INDEX idx_questions_text_search 
ON questions USING gin(to_tsvector('english', question_text));

-- 7. Composite index for most common filter combination
-- Optimizes queries filtering by status + topic + sorting by date
DROP INDEX IF EXISTS idx_questions_status_topic_created;
CREATE INDEX idx_questions_status_topic_created 
ON questions(status, topic_id, created_at DESC, id DESC);

-- 8. Composite index for status + difficulty filtering
DROP INDEX IF EXISTS idx_questions_status_difficulty_created;
CREATE INDEX idx_questions_status_difficulty_created 
ON questions(status, difficulty, created_at DESC, id DESC);

-- 9. Add comment explaining the indexing strategy
COMMENT ON INDEX idx_questions_created_at_id IS 
'Primary index for cursor-based pagination. Essential for keyset pagination performance.';

COMMENT ON INDEX idx_questions_status_topic_created IS 
'Optimizes common query pattern: filtering by status and topic while paginating.';

-- 10. Optional: Add statistics for better query planning
ANALYZE questions;

COMMIT;

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'questions'
ORDER BY indexname;

-- Check index sizes (useful for monitoring)
SELECT
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND relname = 'questions'
ORDER BY pg_relation_size(indexrelid) DESC;
