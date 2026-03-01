-- Add source and external_id to orders for aggregator tracking (Just Eat, Uber Eats, etc.)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_id TEXT;
