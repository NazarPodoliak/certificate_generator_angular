# Certificate Generator Server

This is the Node.js backend server for the Certificate Generator application.

## Features

- RESTful API for user management
- Certificate generation and storage
- SQLite database for data persistence
- Security middleware (Helmet, CORS)
- Request logging with Morgan
- Health check endpoint

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=3000
   CORS_ORIGIN=http://localhost:4200
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Certificates
- `GET /api/users/:id/certificates` - Get user's certificates
- `POST /api/users/:id/certificates` - Create certificate for user

## Database

The server uses SQLite with the following tables:

### Users Table
- `id` (Primary Key)
- `name` (Required)
- `email` (Required, Unique)
- `certificate_data` (Optional)
- `created_at`
- `updated_at`

### Certificates Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `certificate_type` (Required)
- `recipient_name` (Required)
- `issue_date` (Required)
- `certificate_data` (Optional)
- `file_path` (Optional)
- `created_at`

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Input validation**: Request body validation
- **SQL injection protection**: Parameterized queries

## Development

The server runs on port 3000 by default and is configured to accept requests from the Angular frontend running on port 4200.

## Health Check

Visit `http://localhost:3000/health` to check if the server is running properly. 