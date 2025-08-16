-- 04_add_flat_number_with_check.sql
-- Adds `flat_number` to public.members and enforces that, when present,
-- it is 1-5 alphanumeric characters (A–Z, a–z, 0–9). Null is allowed.

-- 1) Add the column if it doesn't exist
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS flat_number VARCHAR(5);

-- 2) Normalize any blank strings to NULL (so the CHECK passes cleanly)
UPDATE public.members
SET flat_number = NULL
WHERE flat_number IS NOT NULL AND btrim(flat_number) = '';

-- 3) Add the CHECK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'members_flat_number_format'
      AND conrelid = 'public.members'::regclass
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_flat_number_format
      CHECK (flat_number IS NULL OR flat_number ~ '^[A-Za-z0-9]{1,5}$');
  END IF;
END $$;
