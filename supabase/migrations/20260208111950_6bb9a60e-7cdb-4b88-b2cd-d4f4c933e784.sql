
-- Add energy level and time estimate enums
CREATE TYPE energy_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE time_estimate AS ENUM ('quick', 'hour', 'day', 'week_plus');

-- Add columns to ideas table
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS energy_level energy_level DEFAULT NULL;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS time_estimate time_estimate DEFAULT NULL;
