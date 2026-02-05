# Hospital Medical System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x LTS or higher
- **MySQL**: v8.x or higher
- **npm**: v10.x or higher (comes with Node.js)

## Quick Start

### 1. Database Setup

First, create the MySQL database:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done if you see node_modules)
npm install

# Configure environment variables
# Edit .env file and update DATABASE_URL with your MySQL credentials
# Default: DATABASE_URL="mysql://root:password@localhost:3306/hospital_db"

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npm run prisma:seed

# Start the backend server
npm run dev
```

The backend server will start on **http://localhost:3000**

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (already done if you see node_modules)
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1

## Demo Accounts

After seeding the database, you can login with these accounts:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | `admin` | `admin123` | System administrator |
| Doctor | `doctor1` | `doctor123` | Doctor - Internal Medicine |
| Nurse | `nurse1` | `nurse123` | Nurse |
| Receptionist | `reception1` | `reception123` | Front desk receptionist |

## Project Structure

```
hospital-medical-system/
├── backend/                    # Backend API (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── validators/        # Request validators
│   │   └── app.ts             # Application entry point
│   ├── logs/                  # Application logs
│   ├── uploads/               # Uploaded files
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/                   # Frontend (Vue 3 + TypeScript)
    ├── src/
    │   ├── api/               # API service layer
    │   ├── assets/            # Static assets
    │   ├── components/        # Vue components
    │   ├── layouts/           # Layout components
    │   ├── router/            # Vue Router configuration
    │   ├── stores/            # Pinia stores
    │   ├── styles/            # Global styles
    │   ├── types/             # TypeScript types
    │   ├── utils/             # Utility functions
    │   ├── views/             # Page components
    │   ├── App.vue            # Root component
    │   └── main.ts            # Application entry point
    ├── public/                # Public static files
    └── package.json
```

## Available Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run prisma:seed  # Seed database with initial data
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@hospital.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "2h"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

#### Change Password
```http
PUT /api/v1/auth/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

Note: New password must contain at least one lowercase letter, one uppercase letter, and one number.

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Database Schema

The system includes the following tables:

1. **users** - System users (admin, doctors, nurses, receptionists)
2. **departments** - Hospital departments
3. **doctors** - Doctor profiles
4. **patients** - Patient information
5. **medical_records** - Medical records
6. **prescriptions** - Prescription details
7. **attachments** - File attachments for medical records
8. **operation_logs** - System operation logs

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/hospital_db"

# JWT Configuration
JWT_SECRET=hospital-medical-system-jwt-secret-key-2024
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=hospital-medical-system-refresh-secret-key-2024
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.development)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=Hospital Medical System
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify MySQL is running:
   ```bash
   # Windows
   net start MySQL80

   # Linux/Mac
   sudo systemctl start mysql
   ```

2. Check database credentials in `backend/.env`
3. Ensure the database `hospital_db` exists

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend**: Change `PORT` in `backend/.env`
**Frontend**: Vite will automatically try the next available port

### Prisma Client Issues

If you encounter Prisma client errors:

```bash
cd backend
npx prisma generate
```

### TypeScript Compilation Errors

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Security Notes

⚠️ **Important for Production**:

1. Change all default passwords and secrets in `.env`
2. Use strong JWT secrets (generate with `openssl rand -base64 32`)
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up rate limiting
6. Enable database backups
7. Review and update security headers

## Next Steps

After successful setup, you can:

1. **Explore the Dashboard**: Login and navigate through the interface
2. **Test API Endpoints**: Use Postman or curl to test the API
3. **View Database**: Run `npm run prisma:studio` in backend directory
4. **Read Documentation**: Check `README.md` for detailed project information
5. **Start Development**: Begin implementing Phase 2 features (Patient Management, Medical Records, etc.)

## Support

For issues or questions:
- Check the main `README.md` for project documentation
- Review the code comments in source files
- Check the logs in `backend/logs/` directory

## License

This project is for educational and demonstration purposes.
