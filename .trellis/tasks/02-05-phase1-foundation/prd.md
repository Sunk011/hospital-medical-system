# Phase 1: Hospital Medical System Foundation

## Goal
Initialize the complete project structure for a hospital medical record management system, including frontend (Vue 3 + TypeScript) and backend (Node.js + Express + Prisma + MySQL) with basic authentication functionality.

## Requirements

### 1. Project Structure Initialization
- [ ] Create frontend directory with Vue 3 + Vite + TypeScript setup
- [ ] Create backend directory with Node.js + Express + TypeScript setup
- [ ] Set up proper .gitignore for both projects
- [ ] Configure package.json with all required dependencies

### 2. Backend Infrastructure
- [ ] Set up Express.js application structure
- [ ] Configure TypeScript with strict mode
- [ ] Set up Prisma ORM with MySQL
- [ ] Create database schema (users, departments, doctors, patients, medical_records, prescriptions, attachments, operation_logs)
- [ ] Implement database migrations
- [ ] Create seed data for testing
- [ ] Set up environment configuration (.env)
- [ ] Implement logging with winston
- [ ] Create error handling middleware
- [ ] Set up CORS and security middleware

### 3. Authentication Module (Backend)
- [ ] Implement JWT token generation and validation
- [ ] Create auth service with bcrypt password hashing
- [ ] Implement login endpoint (POST /api/v1/auth/login)
- [ ] Implement logout endpoint (POST /api/v1/auth/logout)
- [ ] Implement get profile endpoint (GET /api/v1/auth/profile)
- [ ] Create auth middleware for protected routes
- [ ] Implement request validation with express-validator
- [ ] Add operation logging for auth actions

### 4. Frontend Infrastructure
- [ ] Set up Vue 3 project with Vite
- [ ] Configure TypeScript with strict mode
- [ ] Install and configure Element Plus UI library
- [ ] Set up Vue Router with route guards
- [ ] Configure Pinia for state management
- [ ] Set up Axios with interceptors
- [ ] Configure TailwindCSS
- [ ] Create basic layout structure
- [ ] Set up environment variables

### 5. Authentication Module (Frontend)
- [ ] Create login page UI
- [ ] Implement auth store with Pinia
- [ ] Create auth API service
- [ ] Implement login functionality
- [ ] Implement logout functionality
- [ ] Add route guards for authentication
- [ ] Implement token storage and refresh
- [ ] Create user profile display

### 6. Basic Pages
- [ ] Create dashboard/home page
- [ ] Create 404 page
- [ ] Create basic navigation layout

## Acceptance Criteria

- [ ] Backend server starts successfully on port 3000
- [ ] Frontend dev server starts successfully on port 5173
- [ ] Database schema is created with all tables
- [ ] User can register/login with email and password
- [ ] JWT token is generated and validated correctly
- [ ] Protected routes require authentication
- [ ] Frontend can communicate with backend API
- [ ] CORS is properly configured
- [ ] Error handling works correctly
- [ ] Logging captures all important events
- [ ] TypeScript compilation passes with no errors
- [ ] Code follows project structure from README

## Technical Notes

### Backend Tech Stack
- Node.js 20.x LTS
- Express.js 4.x
- TypeScript 5.x
- Prisma 5.x (ORM)
- MySQL 8.x
- JWT for authentication
- bcrypt for password hashing
- winston for logging
- express-validator for validation

### Frontend Tech Stack
- Vue.js 3.x
- Vite 5.x
- TypeScript 5.x
- Vue Router 4.x
- Pinia 2.x
- Element Plus 2.x
- Axios 1.x
- TailwindCSS 3.x

### API Design
- Base path: `/api/v1`
- Authentication: Bearer Token (JWT)
- Response format: JSON with unified structure
- Status codes: RESTful conventions

### Security Considerations
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 2 hours
- HTTPS in production
- SQL injection prevention via Prisma
- XSS protection
- CSRF protection
- Rate limiting on auth endpoints

## File Structure

```
hospital-medical-system/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── .env.development
│   ├── .env.production
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.ts
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── routes/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   ├── validators/
    │   └── app.ts
    ├── logs/
    ├── uploads/
    ├── .env
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    └── nodemon.json
```

## Implementation Order

1. Backend project initialization
2. Database schema and Prisma setup
3. Backend authentication module
4. Frontend project initialization
5. Frontend authentication module
6. Integration testing
