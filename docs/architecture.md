# System Architecture Design

## System Architecture Diagram

The system follows a standard 3-tier architecture:

1.  **Client (Frontend)**: React application (Vite) running in the user's browser. It communicates with the backend via REST APIs over HTTPS.
2.  **Server (Backend)**: Node.js/Express application containerized in Docker. It handles business logic, authentication, and database interactions.
3.  **Database**: PostgreSQL 15 database containerized in Docker. It stores all structured data.

**Flow**:
User -> Browser (Frontend) -> (HTTP/JSON) -> Backend API -> (SQL) -> PostgreSQL

## Database Schema Design (ERD)

### 1. Tenants Table (`tenants`)
- **PK**: `id` (UUID)
- **Attributes**: `name`, `subdomain` (Unique), `status`, `subscription_plan`, `max_users`, `max_projects`.
- **Purpose**: Stores organization details and subscription limits.

### 2. Users Table (`users`)
- **PK**: `id` (UUID)
- **FK**: `tenant_id` -> `tenants.id` (Nullable for Super Admin)
- **Attributes**: `email`, `password_hash`, `full_name`, `role` (super_admin, tenant_admin, user), `is_active`.
- **Constraint**: Unique (`tenant_id`, `email`).

### 3. Projects Table (`projects`)
- **PK**: `id` (UUID)
- **FK**: `tenant_id` -> `tenants.id`
- **FK**: `created_by` -> `users.id`
- **Attributes**: `name`, `description`, `status`.

### 4. Tasks Table (`tasks`)
- **PK**: `id` (UUID)
- **FK**: `project_id` -> `projects.id`
- **FK**: `tenant_id` -> `tenants.id`
- **FK**: `assigned_to` -> `users.id`
- **Attributes**: `title`, `description`, `status`, `priority`, `due_date`.

### 5. Audit Logs Table (`audit_logs`)
- **PK**: `id` (UUID)
- **FK**: `tenant_id` -> `tenants.id`
- **FK**: `user_id` -> `users.id`
- **Attributes**: `action`, `entity_type`, `entity_id`, `ip_address`, `created_at`.

## API Architecture

### Authentication
- `POST /api/auth/register-tenant`: Register new tenant.
- `POST /api/auth/login`: Login user.
- `GET /api/auth/me`: Get current user details.
- `POST /api/auth/logout`: Logout user.

### Tenant Management
- `GET /api/tenants/:tenantId`: Get tenant details (Tenant Admin).
- `PUT /api/tenants/:tenantId`: Update tenant (Tenant Admin/Super Admin).
- `GET /api/tenants`: List all tenants (Super Admin).

### User Management
- `POST /api/tenants/:tenantId/users`: Add user to tenant.
- `GET /api/tenants/:tenantId/users`: List users in tenant.
- `PUT /api/users/:userId`: Update user.
- `DELETE /api/users/:userId`: Delete user.

### Project Management
- `POST /api/projects`: Create project.
- `GET /api/projects`: List projects.
- `PUT /api/projects/:projectId`: Update project.
- `DELETE /api/projects/:projectId`: Delete project.

### Task Management
- `POST /api/projects/:projectId/tasks`: Create task.
- `GET /api/projects/:projectId/tasks`: List tasks.
- `PATCH /api/tasks/:taskId/status`: Update task status.
- `PUT /api/tasks/:taskId`: Update task details.
