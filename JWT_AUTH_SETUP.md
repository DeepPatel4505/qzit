# JWT Authentication Setup for Qzit

This document describes the end-to-end JWT authentication implementation added to the Qzit quiz application.

## Overview

The application now includes complete authentication with the following features:

- **User Registration**: Create new user accounts with username, email, and password
- **User Login**: Authenticate with email and password
- **JWT Tokens**: Access tokens (7 days) and refresh tokens (30 days)
- **Protected Routes**: Secure API endpoints that require authentication
- **Token Refresh**: Automatic token refresh on 401 responses
- **Session Persistence**: User session persists across page reloads

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

The following packages have been added:
- `jsonwebtoken`: For JWT token generation and verification
- `bcryptjs`: For password hashing

### 2. Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```bash
MONGODB_URI=mongodb://localhost:27017/qzit
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 3. Database

The application uses MongoDB. Make sure MongoDB is running:

```bash
# If using MongoDB locally
mongod
```

### 4. Start Backend Server

```bash
npm run dev  # With nodemon for development
# or
npm start   # Production mode
```

Server runs on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory (copy from `.env.example`):

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Frontend

```bash
npm start
```

Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Request/Response Examples

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Protected Endpoints
Include token in Authorization header:
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Protected Routes

The following routes now require authentication:

### Quiz Routes (Write Operations)
- `POST /api/quizzes` - Create quiz (requires auth)
- `PUT /api/quizzes/:id` - Update quiz (requires auth)
- `DELETE /api/quizzes/:id` - Delete quiz (requires auth)
- `GET /api/quizzes` - List quizzes (public)
- `GET /api/quizzes/:id` - Get quiz details (public)

### Attempt Routes
- `POST /api/attempts` - Submit answers (requires auth)
- `POST /api/attempts/progress` - Save progress (requires auth)
- `GET /api/attempts/progress/:quizId` - Get progress (requires auth)
- `GET /api/attempts/user/:userId` - Get user attempts (requires auth)
- `GET /api/attempts/quiz/:quizId` - Get quiz attempts (public)

## Frontend Architecture

### Authentication Context (`src/contexts/AuthContext.js`)

Global state management for authentication:

```javascript
const { 
  user,              // Current user object
  token,             // JWT access token
  loading,           // Loading state
  error,             // Error message
  register,          // Register function
  login,             // Login function
  logout,            // Logout function
  isAuthenticated    // Boolean check
} = useAuth();
```

### Usage in Components

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

The application automatically redirects unauthenticated users to the login page:

```javascript
<ProtectedRoute>
  <AppContent />
</ProtectedRoute>
```

## Token Management

### Token Storage
Tokens are stored in browser's localStorage:
- `token`: Access token (short-lived, 7 days)
- `refreshToken`: Refresh token (long-lived, 30 days)

### Automatic Token Refresh
When an API request returns a 401 response:
1. The axios interceptor attempts to refresh the token using the refresh token
2. If successful, retries the original request with the new token
3. If refresh fails, user is logged out and redirected to login

### Manual Logout
```javascript
const { logout } = useAuth();
logout(); // Clears tokens and redirects to login
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Tokens expire after configured time (default: 7 days)
4. **Refresh Token**: Keep separate from access token for better security
5. **CORS**: Backend CORS settings should restrict to your frontend domain in production
6. **Password Hashing**: Passwords are hashed with bcryptjs before storage

## Troubleshooting

### "Not authorized to access this route"
- User is not logged in or token has expired
- Check if token is stored in localStorage
- Try logging in again

### "Token is not valid"
- Token may be malformed or corrupted
- Try clearing localStorage and logging in again
- Check if JWT_SECRET matches between instances

### CORS Errors
- Ensure backend has CORS enabled for your frontend URL
- Check proxy settings in frontend package.json

### Tokens not persisting
- Check browser's localStorage settings
- Verify localStorage is not disabled
- Check browser console for errors

## Development Notes

### Testing Authentication Locally

1. Start backend: `npm run dev` (from backend directory)
2. Start frontend: `npm start` (from frontend directory)
3. Navigate to http://localhost:3000
4. Click "Register" to create a new account
5. Fill in username, email, and password
6. You'll be automatically logged in and redirected to quizzes
7. Create quizzes and take them with your authenticated session

### Adding Authentication to New Endpoints

For any new protected endpoint:

1. Import the protect middleware:
   ```javascript
   const { protect } = require('../middleware/authMiddleware');
   ```

2. Add it to your route:
   ```javascript
   router.post('/your-route', protect, yourController.action);
   ```

3. Access user ID in controller:
   ```javascript
   exports.action = async (req, res) => {
     const userId = req.userId; // Set by protect middleware
     // ...
   };
   ```

## Next Steps

To make this production-ready:

1. Set strong JWT_SECRET in production environment
2. Enable HTTPS
3. Configure CORS for your production domains
4. Set up proper error logging
5. Consider adding refresh token rotation
6. Implement rate limiting for auth endpoints
7. Add email verification for new registrations
8. Implement password reset functionality

---

For questions or issues, refer to the JWT auth documentation or React Router documentation.
