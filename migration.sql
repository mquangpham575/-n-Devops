-- Migration script: Convert blog code field to category system
-- Blog 'name' field is kept, only 'code' is replaced with 'categoryId'
-- Run this script after deploying the new code

-- Step 1: Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Step 2: Create default category for existing blogs
INSERT INTO categories (id, code, name, description, active, created_at, updated_at)
VALUES (gen_random_uuid(), 'UNCATEGORIZED', 'Chưa phân loại', 'Thể loại mặc định cho các bài viết hiện có', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Step 3: Add category_id column to blogs table (nullable first)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category_id UUID;

-- Step 4: Set category_id for all existing blogs to default category
UPDATE blogs 
SET category_id = (SELECT id FROM categories WHERE code = 'UNCATEGORIZED' LIMIT 1)
WHERE category_id IS NULL;

-- Step 5: Make category_id NOT NULL
ALTER TABLE blogs ALTER COLUMN category_id SET NOT NULL;

-- Step 6: Add foreign key constraint (check if exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_blog_category'
    ) THEN
        ALTER TABLE blogs 
        ADD CONSTRAINT fk_blog_category 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id);
    END IF;
END $$;

-- Step 7: Drop old code column (KEEP name column)
ALTER TABLE blogs DROP COLUMN IF EXISTS code;

-- Step 8: Drop unique constraint on code if exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_blog_code'
    ) THEN
        ALTER TABLE blogs DROP CONSTRAINT uk_blog_code;
    END IF;
END $$;

-- Step 9: Create index on category_id for performance
CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON blogs(category_id);

-- Verification queries (run these to verify migration):
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM blogs WHERE category_id IS NULL;
-- SELECT b.id, b.name, b.title, c.code, c.name as category_name 
-- FROM blogs b JOIN categories c ON b.category_id = c.id LIMIT 10;
