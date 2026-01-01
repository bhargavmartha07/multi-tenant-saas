# Technical Specification

## Project Structure

### Backend (`/backend`)
```
backend/
  ├── src/
  │   ├── config/         # DB config, environment variables
  │   ├── controllers/    # Request handlers (Auth, Tenants, Users, etc.)
  │   ├── middleware/     # Auth, Role, Error handling middleware
  │   ├── routes/         # API Route definitions
  │   ├── utils/          # Helper functions (Hash, JWT)
  │   ├── server.js       # App entry point
  │   └── app.js          # Express app setup
  ├── migrations/         # SQL migration files
  ├── seeds/              # SQL seed files
  ├── tests/              # Jest tests
  ├── Dockerfile
  └── package.json
```

### Frontend (`/frontend`)
```
frontend/
  ├── src/
  │   ├── assets/         # Images, global styles
  │   ├── components/     # Reusable UI components (Navbar, Modal, etc.)
  │   ├── context/        # React Context (AuthContext)
  │   ├── hooks/          # Custom hooks (useAuth, useApi)
  │   ├── layouts/        # Page layouts (DashboardLayout)
  │   ├── pages/          # View components (Login, Dashboard, Projects)
  │   ├── services/       # API service functions
  │   ├── App.jsx         # Main component with Routes
  │   └── main.jsx        # Entry point
  ├── Dockerfile
  └── package.json
```

## Development Setup Guide

### Prerequisites
- Node.js v18+
- Docker & Docker Compose

### Environment Variables
Copy `.env.example` to `.env` in `backend/` and `frontend/`.

#### Backend `.env`
```
DB_HOST=database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
```

### Installation & Running Locally (Docker)
1.  **Clone the repository**.
2.  **Start Services**:
    ```bash
    docker-compose up -d --build
    ```
3.  **Access App**:
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:5000`

### Running Tests
```bash
cd backend
npm test
```
