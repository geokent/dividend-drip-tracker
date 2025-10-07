-- Critical Security Fix 1: Reassign all blog posts to Geo
-- Update all blog posts from orphaned author to Geo's user_id
UPDATE blog_posts 
SET author_id = '4b2a403d-6061-415f-bfb5-18936722274b'
WHERE author_id = 'b546fd92-037b-452c-8ff2-cef88ce72c60';

-- Critical Security Fix 2: Add foreign key constraint to blog_posts
-- Ensures blog posts can't reference non-existent authors
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Critical Security Fix 3: Add email validation constraint to exit_intent_leads
-- Enforces email format at database level
ALTER TABLE exit_intent_leads
ADD CONSTRAINT exit_intent_leads_email_format_check
CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' AND length(email) <= 255);

-- Add index for faster duplicate checking if not exists
CREATE INDEX IF NOT EXISTS idx_exit_intent_leads_email ON exit_intent_leads(email);