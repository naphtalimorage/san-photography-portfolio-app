-- ========================================
-- SUPABASE SERVICES SEED
-- Run in Supabase SQL Editor
-- ========================================

-- Insert sample services only if table is empty
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM services LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO services (title, price, features, icon_name, sort_order)
  VALUES
    (
      'Weddings',
      'From $3,500',
      ARRAY[
        'Full day coverage (up to 10 hours)',
        'Second photographer included',
        '400+ edited images',
        'Online gallery & downloads',
        'Engagement session',
        'Wedding album (30 pages)'
      ],
      'Heart',
      0
    ),
    (
      'Portraits',
      'From $800',
      ARRAY[
        '2-hour session',
        '2 outfit changes',
        '50+ edited images',
        'Online gallery & downloads',
        'Professional retouching',
        'Print-ready files'
      ],
      'Camera',
      1
    ),
    (
      'Events',
      'From $1,500',
      ARRAY[
        'Up to 5 hours coverage',
        '200+ edited images',
        'Online gallery & downloads',
        'Same-week delivery',
        'Social media highlights',
        'Print-ready files'
      ],
      'PartyPopper',
      2
    ),
    (
      'Lifestyle',
      'From $1,200',
      ARRAY[
        '3-hour on-location session',
        'Natural light photography',
        '75+ edited images',
        'Online gallery & downloads',
        'Personalized storytelling',
        'Style consultation'
      ],
      'ImageIcon',
      3
    );
END $$;

