-- Zones + categories.zone_id for pickwalk
-- Idempotent: run on template install for tenant {{SCHEMA_NAME}}

-- Create zones table if products exists (ecom tenant)
CREATE TABLE IF NOT EXISTS {{SCHEMA_NAME}}.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order NUMERIC(20,2),
  vendor_id UUID
);
CREATE INDEX IF NOT EXISTS idx_zones_tenant_id ON {{SCHEMA_NAME}}.zones(tenant_id);

-- Add zone_id to categories
ALTER TABLE {{SCHEMA_NAME}}.categories ADD COLUMN IF NOT EXISTS zone_id UUID;
