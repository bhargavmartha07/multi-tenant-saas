-- =========================
-- SEED DATA (IDEMPOTENT)
-- =========================

-- Super Admin
INSERT INTO users (id, email, password_hash, full_name, role, tenant_id)
VALUES (
  uuid_generate_v4(),
  'superadmin@system.com',
  '$2b$10$PwVO1FI/fcsRcltfLMsGfupfpAVGitcLVWycV.YtmOwXLJYYef1de',
  'Super Admin',
  'super_admin',
  NULL
)
ON CONFLICT DO NOTHING;

-- Tenant
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
  uuid_generate_v4(),
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
)
ON CONFLICT DO NOTHING;

-- Tenant Admin
WITH t AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'admin@demo.com',
  '$2b$10$TVpRCv033byz7qapDJkr0OFR13h4CVUEac2mIPxb3l3rc.YHfAkwW',
  'Demo Admin',
  'tenant_admin'
FROM t
ON CONFLICT DO NOTHING;

-- Regular User 1
WITH t AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'user1@demo.com',
  '$2b$10$FisEknKpWmd4g/i6uxUTY.8C1cfkaTDoNtVmYc8ZhsPgSahRNJpz6',
  'Demo User 1',
  'user'
FROM t
ON CONFLICT DO NOTHING;

-- Regular User 2
WITH t AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'user2@demo.com',
  '$2b$10$FisEknKpWmd4g/i6uxUTY.8C1cfkaTDoNtVmYc8ZhsPgSahRNJpz6',
  'Demo User 2',
  'user'
FROM t
ON CONFLICT DO NOTHING;
