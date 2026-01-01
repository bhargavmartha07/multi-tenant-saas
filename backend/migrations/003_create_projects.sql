-- 003_create_projects.sql
-- Purpose: Store projects per tenant

CREATE TYPE project_status AS ENUM ('active', 'archived', 'completed');

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  status project_status NOT NULL DEFAULT 'active',

  created_by UUID NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_projects_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_projects_creator
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- 🔍 Required index for tenant isolation performance
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id
ON projects(tenant_id);