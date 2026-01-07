-- Add comments_count column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Add views_count column if it doesn't exist (commonly used)
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Function to update comments_count when a comment is added or deleted
CREATE OR REPLACE FUNCTION update_question_comments_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS increment_comments_count ON comments;
DROP TRIGGER IF EXISTS decrement_comments_count ON comments;

-- Trigger for INSERT operations on comments
CREATE TRIGGER increment_comments_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_question_comments_count();

-- Trigger for DELETE operations on comments
CREATE TRIGGER decrement_comments_count
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_question_comments_count();

-- Update existing counts to match actual comment counts
UPDATE questions q
SET comments_count = (
  SELECT COUNT(*)
  FROM comments c
  WHERE c.question_id = q.id
);
