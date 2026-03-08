-- Add parent_id column to comments table for nested replies
ALTER TABLE comments ADD COLUMN parent_id UUID;

-- Add foreign key constraint
ALTER TABLE comments 
ADD CONSTRAINT fk_parent_comment 
FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Create index for better performance when querying replies
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_blog_parent ON comments(blog_id, parent_id);
