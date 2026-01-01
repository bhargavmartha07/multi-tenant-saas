# API Documentation

## Authentication Module

### 1. Tenant Registration
- **Endpoint**: `POST /api/auth/register-tenant`
- **Auth**: None
- **Body**: `{ tenantName, subdomain, adminEmail, adminPassword, adminFullName }`
- **Response**: `201 Created` - `{ success: true, data: { tenantId, adminUser } }`

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Auth**: None
- **Body**: `{ email, password, tenantSubdomain }`
- **Response**: `200 OK` - `{ success: true, data: { token, user } }`

### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Auth**: Bearer Token
- **Response**: `200 OK` - `{ success: true, data: { user } }`

### 4. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Auth**: Bearer Token
- **Response**: `200 OK` - `{ success: true, message: "Logged out" }`

## Tenant Management Module

### 5. Get Tenant Details
- **Endpoint**: `GET /api/tenants/:tenantId`
- **Auth**: Tenant Admin or Super Admin
- **Response**: `200 OK` - `{ success: true, data: { tenant } }`

### 6. Update Tenant
- **Endpoint**: `PUT /api/tenants/:tenantId`
- **Auth**: Tenant Admin (Name only) or Super Admin (All fields)
- **Body**: `{ name, status?, subscriptionPlan?, maxUsers?, maxProjects? }`
- **Response**: `200 OK` - `{ success: true, message: "Updated" }`

### 7. List All Tenants
- **Endpoint**: `GET /api/tenants`
- **Auth**: Super Admin ONLY
- **Query**: `page, limit, status, subscriptionPlan`
- **Response**: `200 OK` - `{ success: true, data: { tenants, pagination } }`

## User Management Module

### 8. Add User to Tenant
- **Endpoint**: `POST /api/tenants/:tenantId/users`
- **Auth**: Tenant Admin
- **Body**: `{ email, password, fullName, role }`
- **Response**: `201 Created` - `{ success: true, data: { user } }`

### 9. List Tenant Users
- **Endpoint**: `GET /api/tenants/:tenantId/users`
- **Auth**: Member of Tenant
- **Query**: `search, role, page, limit`
- **Response**: `200 OK` - `{ success: true, data: { users, pagination } }`

### 10. Update User
- **Endpoint**: `PUT /api/users/:userId`
- **Auth**: Tenant Admin
- **Body**: `{ fullName, role?, isActive? }`
- **Response**: `200 OK` - `{ success: true, data: { user } }`

### 11. Delete User
- **Endpoint**: `DELETE /api/users/:userId`
- **Auth**: Tenant Admin
- **Response**: `200 OK` - `{ success: true, message: "Deleted" }`

## Project Management Module

### 12. Create Project
- **Endpoint**: `POST /api/projects`
- **Auth**: Required
- **Body**: `{ name, description, status? }`
- **Response**: `201 Created` - `{ success: true, data: { project } }`

### 13. List Projects
- **Endpoint**: `GET /api/projects`
- **Auth**: Required
- **Query**: `status, search, page, limit`
- **Response**: `200 OK` - `{ success: true, data: { projects, pagination } }`

### 14. Update Project
- **Endpoint**: `PUT /api/projects/:projectId`
- **Auth**: Tenant Admin or Creator
- **Body**: `{ name, description, status }`
- **Response**: `200 OK` - `{ success: true, data: { project } }`

### 15. Delete Project
- **Endpoint**: `DELETE /api/projects/:projectId`
- **Auth**: Tenant Admin (their tenant) or Super Admin
- **Query**: `force=true` (optional) — when present allows archiving even if active tasks exist
- **Behavior**: Projects are *archived* (soft-delete) by default. If active tasks (status `todo` or `in_progress`) exist, deletion will be blocked unless `?force=true` is provided.
- **Audit**: Deletion/archival is recorded in `audit_logs` with action `delete_project`
- **Response**: `200 OK` - `{ success: true, data: { id, status: 'archived' } }`

## Task Management Module

### 16. Create Task
- **Endpoint**: `POST /api/projects/:projectId/tasks`
- **Auth**: Required
- **Body**: `{ title, description?, assignedTo?, priority?, dueDate? }`
- **Response**: `201 Created` - `{ success: true, data: { task } }`

### 17. List Project Tasks
- **Endpoint**: `GET /api/projects/:projectId/tasks`
- **Auth**: Required
- **Query**: `status, assignedTo, priority, search, page, limit`
- **Response**: `200 OK` - `{ success: true, data: { tasks, pagination } }`

### 18. Update Task Status
- **Endpoint**: `PATCH /api/tasks/:taskId/status`
- **Auth**: Required
- **Body**: `{ status }`
- **Response**: `200 OK` - `{ success: true, data: { task } }`

### 19. Update Task
- **Endpoint**: `PUT /api/tasks/:taskId`
- **Auth**: Required
- **Body**: `{ title, description, status, priority, assignedTo, dueDate }`
- **Response**: `200 OK` - `{ success: true, data: { task } }`
