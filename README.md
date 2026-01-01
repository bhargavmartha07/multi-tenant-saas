# Multi-Tenant SaaS Project Management Platform

A robust, dockerized SaaS application built with Node.js, React, and PostgreSQL, featuring strict data isolation, role-based access control, and comprehensive reporting.

## 🚀 Quick Start (Docker)

The easiest way to run the application is using Docker Compose. This starts the database, backend, and frontend services with a single command.

### Prerequisites
- Docker and Docker Compose installed on your system.

### Running the App
1. Clone the repository.
2. Navigate to the project root.
3. Run the following command:
   ```bash
   docker-compose up -d
   ```
4. Wait for the containers to start and the database to initialize.
5. Access the applications:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
   - **Database**: `localhost:5432`

### Automatic Initialization
The application is configured to automatically:
- Run database migrations on startup.
- Load seed data (Super Admin, Demo Tenants, and Users).
- Health checks are performed to ensure backend readiness before frontend connection.

## 🏗 Architecture Overview

The system follows a standard 3-tier architecture designed for scalability and isolation:

1.  **Frontend**: React (Vite) - A responsive dashboard for managing tenants, projects, and tasks.
2.  **Backend**: Node.js (Express) - RESTful API with JWT authentication and tenant-level middleware.
3.  **Database**: PostgreSQL 15 - Shared database with logical isolation using `tenant_id`.

For a deeper dive into the architectural decisions, see [docs/architecture.md](docs/architecture.md) and [docs/research.md](docs/research.md).

## 📄 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Research & Analysis](docs/research.md)**: In-depth analysis of multi-tenancy models and security.
- **[PRD](docs/PRD.md)**: Product Requirements Document with user personas and features.
- **[API Documentation](docs/API.md)**: Full list of 19 endpoints with request/response examples.
- **[Technical Spec](docs/technical-spec.md)**: Project structure and development guide.
- **[Architecture & ERD](docs/architecture.md)**: System design and database schema.

## 🔐 Test Credentials (Seed Data)

The following credentials are automatically loaded into the system for evaluation. These can also be found in `submission.json`.

| Role | Email | Password | Tenant |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@system.com` | `Admin@123` | N/A |
| **Tenant Admin** | `admin@demo.com` | `Demo@123` | Demo Company |
| **Regular User** | `user1@demo.com` | `User@123` | Demo Company |

## 🎥 Demo Video

Watch the full walkthrough and demonstration of the application:
[YouTube Demo Video Link](https://youtube.com/placeholder-demo-link)

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS (for styling), Lucide-react (icons).
- **Backend**: Node.js, Express, PostgreSQL (node-pg), JWT, Bcrypt.
- **DevOps**: Docker, Docker Compose.

---
© 2026 Multi-Tenant SaaS Project. All Rights Reserved.
