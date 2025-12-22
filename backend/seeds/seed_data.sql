-- Seed Data for Multi-Tenant SaaS

-- =========================
-- SUPER ADMIN (NO TENANT)
-- =========================
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  uuid_generate_v4(),
  NULL,
  'superadmin@system.com',
  '$2b$10$9k4xKQ9qK1J9Qx8b8QyZ9eHq2nHkE1Yw2Z3QnYQZqJ4GQk2pYJp6y',
  'System Admin',
  'super_admin'
);

-- =========================
-- DEMO TENANT
-- =========================
INSERT INTO tenants (id, name, subdomain, subscription_plan, max_users, max_projects)
VALUES (
  uuid_generate_v4(),
  'Demo Company',
  'demo',
  'pro',
  25,
  15
);

-- =========================
-- TENANT ADMIN
-- =========================
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'admin@demo.com',
  '$2b$10$z9x4F3QqXkQp3r3MZC2y9u1BqZr1x9yJQKQJv9Zk2sX7KZk5QmK8a',
  'Demo Admin',
  'tenant_admin'
FROM tenants t WHERE t.subdomain = 'demo';

-- =========================
-- REGULAR USERS
-- =========================
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'user1@demo.com',
  '$2b$10$Qp2X8JYk9Q1qZKXQZy9x4nJr3Zp1M2kYQZQk8KJ9YQp3Xk7QZ9K2',
  'Demo User One',
  'user'
FROM tenants t WHERE t.subdomain = 'demo';

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'user2@demo.com',
  '$2b$10$Qp2X8JYk9Q1qZKXQZy9x4nJr3Zp1M2kYQZQk8KJ9YQp3Xk7QZ9K2',
  'Demo User Two',
  'user'
FROM tenants t WHERE t.subdomain = 'demo';

-- =========================
-- PROJECTS
-- =========================
INSERT INTO projects (id, tenant_id, name, description, created_by)
SELECT
  uuid_generate_v4(),
  t.id,
  'Project Alpha',
  'First demo project',
  u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo';

INSERT INTO projects (id, tenant_id, name, description, created_by)
SELECT
  uuid_generate_v4(),
  t.id,
  'Project Beta',
  'Second demo project',
  u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo';

-- =========================
-- TASKS
-- =========================
INSERT INTO tasks (id, project_id, tenant_id, title, priority)
SELECT
  uuid_generate_v4(),
  p.id,
  p.tenant_id,
  'Initial Task for Alpha',
  'high'
FROM projects p WHERE p.name = 'Project Alpha';

INSERT INTO tasks (id, project_id, tenant_id, title, priority)
SELECT
  uuid_generate_v4(),
  p.id,
  p.tenant_id,
  'Initial Task for Beta',
  'medium'
FROM projects p WHERE p.name = 'Project Beta';
