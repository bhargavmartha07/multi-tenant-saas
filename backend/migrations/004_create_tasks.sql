-- 004_create_tasks.sql
-- Purpose: Store tasks within projects for each tenant

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID NOT NULL,
  tenant_id UUID NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',

  assigned_to UUID,
  due_date DATE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tasks_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tasks_assigned_user
    FOREIGN KEY (assigned_to)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- 🔍 Required composite index
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_project
ON tasks(tenant_id, project_id);

-- 🔍 Optional but recommended
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id
ON tasks(tenant_id);