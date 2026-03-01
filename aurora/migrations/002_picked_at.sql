-- picked_at, picked_by on order_items for learned pickwalk
-- Idempotent: run on template install for tenant {{SCHEMA_NAME}}

ALTER TABLE {{SCHEMA_NAME}}.order_items ADD COLUMN IF NOT EXISTS picked_at TIMESTAMPTZ;
ALTER TABLE {{SCHEMA_NAME}}.order_items ADD COLUMN IF NOT EXISTS picked_by TEXT;
