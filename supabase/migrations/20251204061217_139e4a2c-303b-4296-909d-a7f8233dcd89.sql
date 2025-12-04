-- Add Default Theme (free, always owned by everyone)
INSERT INTO shop_items (name, description, type, price, is_available, config, preview_url) VALUES
('Default Theme', 'The classic PiggyWise gold theme', 'theme', 0, true, 
 '{"primary": "43 100% 51%", "primaryGlow": "43 100% 61%", "gradient": "linear-gradient(135deg, hsl(43 100% 51%) 0%, hsl(43 100% 61%) 100%)", "isDefault": true}', null);

-- Update Dark Mode Theme with correct dark colors
UPDATE shop_items SET config = '{"primary": "220 15% 25%", "primaryGlow": "220 15% 35%", "gradient": "linear-gradient(135deg, hsl(220 15% 15%) 0%, hsl(220 15% 25%) 100%)", "background": "220 15% 10%", "foreground": "220 10% 90%", "card": "220 15% 15%", "isDark": true}' 
WHERE name = 'Dark Mode Theme';

-- Add more color themes
INSERT INTO shop_items (name, description, type, price, is_available, config) VALUES
('Ocean Blue', 'Calm ocean-inspired blues', 'theme', 400, true, 
 '{"primary": "200 80% 50%", "primaryGlow": "190 80% 60%", "gradient": "linear-gradient(135deg, hsl(200 80% 50%) 0%, hsl(190 80% 60%) 100%)"}'),
('Forest Green', 'Natural earthy greens', 'theme', 400, true, 
 '{"primary": "150 60% 40%", "primaryGlow": "140 60% 50%", "gradient": "linear-gradient(135deg, hsl(150 60% 40%) 0%, hsl(140 60% 50%) 100%)"}'),
('Sunset Orange', 'Warm sunset vibes', 'theme', 450, true, 
 '{"primary": "25 90% 55%", "primaryGlow": "15 90% 60%", "gradient": "linear-gradient(135deg, hsl(25 90% 55%) 0%, hsl(15 90% 60%) 100%)"}'),
('Royal Purple', 'Elegant purple tones', 'theme', 500, true, 
 '{"primary": "270 60% 55%", "primaryGlow": "260 60% 65%", "gradient": "linear-gradient(135deg, hsl(270 60% 55%) 0%, hsl(260 60% 65%) 100%)"}'),
('Cherry Blossom', 'Soft pink Japanese aesthetic', 'theme', 550, true, 
 '{"primary": "350 70% 65%", "primaryGlow": "340 70% 75%", "gradient": "linear-gradient(135deg, hsl(350 70% 65%) 0%, hsl(340 70% 75%) 100%)"}'),
('Midnight Blue', 'Deep navy elegance', 'theme', 600, true, 
 '{"primary": "230 70% 45%", "primaryGlow": "220 70% 55%", "gradient": "linear-gradient(135deg, hsl(230 70% 45%) 0%, hsl(220 70% 55%) 100%)", "isDark": true}');

-- Update backgrounds with proper configs
UPDATE shop_items SET config = '{"gradient": "linear-gradient(135deg, hsl(220 80% 60%) 0%, hsl(280 80% 60%) 50%, hsl(340 80% 60%) 100%)", "type": "gradient"}' 
WHERE name = 'Abstract Waves';

UPDATE shop_items SET config = '{"gradient": "linear-gradient(45deg, hsl(200 20% 20%) 25%, transparent 25%), linear-gradient(-45deg, hsl(200 20% 20%) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(200 20% 20%) 75%), linear-gradient(-45deg, transparent 75%, hsl(200 20% 20%) 75%)", "type": "pattern", "backgroundColor": "hsl(200 20% 15%)"}' 
WHERE name = 'Geometric Pattern';

-- Add more backgrounds
INSERT INTO shop_items (name, description, type, price, is_available, config) VALUES
('Starry Night', 'Beautiful night sky gradient', 'background', 500, true, 
 '{"gradient": "linear-gradient(180deg, hsl(240 50% 15%) 0%, hsl(260 60% 25%) 50%, hsl(280 50% 35%) 100%)", "type": "gradient"}'),
('Sunrise', 'Warm morning colors', 'background', 450, true, 
 '{"gradient": "linear-gradient(180deg, hsl(200 80% 60%) 0%, hsl(40 90% 70%) 50%, hsl(20 90% 60%) 100%)", "type": "gradient"}'),
('Northern Lights', 'Aurora borealis effect', 'background', 700, true, 
 '{"gradient": "linear-gradient(135deg, hsl(180 60% 40%) 0%, hsl(140 70% 45%) 33%, hsl(280 60% 50%) 66%, hsl(320 60% 45%) 100%)", "type": "gradient"}');

-- Update avatar frames with proper configs
UPDATE shop_items SET config = '{"borderColor": "hsl(43 100% 50%)", "borderWidth": "3px", "borderStyle": "solid", "glow": "0 0 10px hsl(43 100% 50% / 0.5)"}' 
WHERE name = 'Golden Frame';

-- Add more avatar frames
INSERT INTO shop_items (name, description, type, price, is_available, config) VALUES
('Silver Frame', 'Sleek silver border', 'avatar_frame', 500, true, 
 '{"borderColor": "hsl(0 0% 75%)", "borderWidth": "3px", "borderStyle": "solid", "glow": "0 0 10px hsl(0 0% 75% / 0.5)"}'),
('Rainbow Frame', 'Colorful gradient border', 'avatar_frame', 1000, true, 
 '{"borderImage": "linear-gradient(45deg, hsl(0 80% 60%), hsl(60 80% 60%), hsl(120 80% 60%), hsl(180 80% 60%), hsl(240 80% 60%), hsl(300 80% 60%)) 1", "borderWidth": "4px", "borderStyle": "solid"}'),
('Diamond Frame', 'Precious diamond sparkle', 'avatar_frame', 1200, true, 
 '{"borderColor": "hsl(200 80% 70%)", "borderWidth": "4px", "borderStyle": "double", "glow": "0 0 15px hsl(200 80% 70% / 0.6)"}');

-- Update icons with proper configs (emoji-based for simplicity)
UPDATE shop_items SET config = '{"emoji": "🐷", "color": "hsl(43 100% 50%)"}' WHERE name = 'Golden Pig Icon';
UPDATE shop_items SET config = '{"emoji": "🚀", "color": "hsl(200 80% 50%)"}' WHERE name = 'Rocket Icon';
UPDATE shop_items SET config = '{"emoji": "💎", "color": "hsl(200 90% 70%)"}' WHERE name = 'Diamond Icon';

-- Add more icons
INSERT INTO shop_items (name, description, type, price, is_available, config) VALUES
('Crown Icon', 'Feel like royalty', 'icon', 500, true, '{"emoji": "👑", "color": "hsl(43 100% 50%)"}'),
('Star Icon', 'Shine bright', 'icon', 350, true, '{"emoji": "⭐", "color": "hsl(50 100% 50%)"}'),
('Fire Icon', 'Hot savings streak', 'icon', 400, true, '{"emoji": "🔥", "color": "hsl(15 90% 55%)"}'),
('Money Bag Icon', 'Show your wealth', 'icon', 450, true, '{"emoji": "💰", "color": "hsl(120 60% 45%)"}');