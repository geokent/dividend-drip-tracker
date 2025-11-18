-- Update profiles to ensure all have display names and bios
UPDATE profiles 
SET 
  display_name = COALESCE(NULLIF(display_name, ''), 'DivTrkr Team'),
  bio = COALESCE(NULLIF(bio, ''), 'Financial content writer specializing in dividend investing strategies, portfolio building, and long-term wealth creation.')
WHERE display_name IS NULL OR display_name = '' OR bio IS NULL OR bio = '';

-- Update the main author profile with detailed bio
UPDATE profiles 
SET 
  bio = 'Lead financial analyst and dividend investing expert with over 10 years of experience in portfolio management. Specializes in dividend growth strategies, REITs, and building sustainable passive income streams.',
  is_public = true
WHERE user_id = '4b2a403d-6061-415f-bfb5-18936722274b';