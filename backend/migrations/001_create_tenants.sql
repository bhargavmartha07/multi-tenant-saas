-- 001_create_tenants.sql
-- Purpose: Store organization (tenant) information

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- ENUM TYPES (SAFE)
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
    CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
  END IF;
END$$;

-- =========================
-- TENANTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,

  status tenant_status NOT NULL DEFAULT 'active',
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',

  max_users INTEGER NOT NULL DEFAULT 5,
  max_projects INTEGER NOT NULL DEFAULT 3,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);