-- 002_create_users.sql
-- Purpose: Store users with tenant association and roles

CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'user');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  tenant_id UUID NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,

  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_email_per_tenant
    UNIQUE (tenant_id, email),

  -- 🔒 Super admin must NOT belong to a tenant
  CONSTRAINT super_admin_has_no_tenant
    CHECK (
      (role = 'super_admin' AND tenant_id IS NULL)
      OR
      (role <> 'super_admin' AND tenant_id IS NOT NULL)
    )
);