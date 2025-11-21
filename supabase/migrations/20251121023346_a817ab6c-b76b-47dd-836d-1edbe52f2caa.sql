-- Update existing shop items with theme configurations
-- We'll use the existing UUIDs from the database

-- Add active_theme_id column to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS active_theme_id UUID REFERENCES shop_items(id);

-- Update existing theme items with proper configs
UPDATE shop_items 
SET config = '{"primary": "210 100% 50%", "primaryGlow": "200 100% 60%", "gradient": "linear-gradient(135deg, hsl(210 100% 50%) 0%, hsl(200 100% 40%) 100%)"}'::jsonb
WHERE name = 'Dark Mode Theme';

UPDATE shop_items 
SET config = '{"primary": "330 80% 60%", "primaryGlow": "310 80% 70%", "gradient": "linear-gradient(135deg, hsl(330 80% 60%) 0%, hsl(310 80% 50%) 100%)"}'::jsonb
WHERE name = 'Pastel Paradise';

UPDATE shop_items 
SET config = '{"primary": "280 100% 60%", "primaryGlow": "260 100% 70%", "gradient": "linear-gradient(135deg, hsl(280 100% 60%) 0%, hsl(260 100% 50%) 100%)"}'::jsonb
WHERE name = 'Neon Dreams';

UPDATE shop_items 
SET config = '{"primary": "0 0% 20%", "primaryGlow": "0 0% 30%", "gradient": "linear-gradient(135deg, hsl(0 0% 95%) 0%, hsl(0 0% 98%) 100%)"}'::jsonb
WHERE name = 'Minimalist';