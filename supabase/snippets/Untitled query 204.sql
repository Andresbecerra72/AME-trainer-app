ALTER TABLE question_imports 
ADD COLUMN IF NOT EXISTS raw_pages JSONB DEFAULT NULL;

-- Create index for performance when querying by raw_pages existence
CREATE INDEX IF NOT EXISTS idx_question_imports_has_pages 
  ON question_imports ((raw_pages IS NOT NULL));