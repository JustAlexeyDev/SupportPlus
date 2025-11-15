# SupportPlus Backend API

NestJS backend server with authentication, OAuth, and beneficiary categories management.

## Features

- **Email/Password Authentication**: Registration and login with email and 5-digit PIN code
- **OAuth Integration**: Google OAuth2 authentication
- **Beneficiary Categories**: Select and manage льготные категории (beneficiary categories)
- **SQLite Database**: Lightweight database for development
- **JWT Authentication**: Secure token-based authentication

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Set `JWT_SECRET` to a secure random string
   - Configure Google OAuth credentials (optional, for OAuth to work)

## Running the Application

### Development
```bash
npm run start:dev
```

The server will start on `http://localhost:8000`

### Swagger Documentation

Once the server is running, Swagger API documentation is available at:
- **Swagger UI**: `http://localhost:8000/api`

The Swagger interface allows you to:
- View all available API endpoints
- Test endpoints directly from the browser
- See request/response schemas
- Authenticate using JWT tokens (click "Authorize" button)

### Production
```bash
npm run build
npm run start:prod
```

## Database Setup

The SQLite database (`supportplus.db`) will be created automatically on first run.

To seed beneficiary categories, make a POST request to:
```
POST http://localhost:3001/beneficiary-categories/seed
```

## API Endpoints

### Authentication

- `POST /auth/login` - Login with email and PIN code
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Users

- `POST /users` - Register new user
- `GET /users/profile` - Get current user profile (requires auth)
- `PATCH /users/profile` - Update user profile (requires auth)

### Beneficiary Categories

- `GET /beneficiary-categories` - Get all categories
- `GET /beneficiary-categories/:id` - Get category by ID
- `POST /beneficiary-categories/seed` - Seed default categories

## Example Requests

### Register User
```bash
POST /users
{
  "email": "user@example.com",
  "pinCode": "12345",
  "snils": "123-456-789 01",
  "region": "Москва",
  "beneficiaryCategoryIds": [1, 2]
}
```

### Login
```bash
POST /auth/login
{
  "email": "user@example.com",
  "pinCode": "12345"
}
```

### Update Profile
```bash
PATCH /users/profile
Authorization: Bearer <token>
{
  "snils": "123-456-789 01",
  "region": "Санкт-Петербург",
  "beneficiaryCategoryIds": [1, 3, 5]
}
```

## Beneficiary Categories

Default categories:
- Пенсионер (Pensioner)
- Инвалид (Disabled)
- Многодетная семья (Large Family)
- Ветеран (Veteran)
- Малоимущий (Low Income)

## Swagger API Documentation

The API is fully documented with Swagger. Access the interactive documentation at:
- **URL**: `http://localhost:8000/api`

### Using Swagger

1. Open `http://localhost:8000/api` in your browser
2. To test protected endpoints:
   - First, login via `POST /auth/login` to get a JWT token
   - Click the "Authorize" button at the top
   - Enter your JWT token (format: `Bearer <token>` or just `<token>`)
   - Click "Authorize" and "Close"
   - Now you can test protected endpoints

### Features

- Interactive API testing
- Request/response examples
- Authentication support
- Schema validation
- All endpoints grouped by tags

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Set `synchronize: false` in `app.module.ts` for production
- Implement rate limiting for production
- Add input validation and sanitization
- Disable Swagger in production or restrict access

## License

ISC

