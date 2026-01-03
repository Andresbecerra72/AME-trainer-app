-- Migration: Add raw_pages column for page-by-page processing
-- This allows storing individual pages as JSONB array to avoid truncation errors

-- Add raw_pages column to question_imports table
ALTER TABLE question_imports 
ADD COLUMN IF NOT EXISTS raw_pages JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN question_imports.raw_pages IS 
  'Array of individual page texts (JSONB). Used for page-by-page processing to avoid OpenAI response truncation on large documents.';

-- Create index for performance when querying by raw_pages existence
CREATE INDEX IF NOT EXISTS idx_question_imports_has_pages 
  ON question_imports ((raw_pages IS NOT NULL));

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: raw_pages column added to question_imports table';
  RAISE NOTICE 'Page-by-page processing now available for large documents';
END $$;
