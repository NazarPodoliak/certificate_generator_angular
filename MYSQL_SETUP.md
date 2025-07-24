# MySQL Database Setup

This application has been converted from SQLite to MySQL. Follow these steps to set up the MySQL database:

## Prerequisites

1. **MySQL Server**: Make sure you have MySQL Server installed on your system
2. **MySQL Workbench** (optional): For database management and visualization

## Database Setup

### 1. Create the Database

Connect to your MySQL server and create the database:

```sql
CREATE DATABASE certificate_app;
```

### 2. Create a User (Optional but Recommended)

```sql
CREATE USER 'certificate_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON certificate_app.* TO 'certificate_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Configuration

Copy the `env.example` file to `.env` and update the database configuration:

```bash
cp env.example .env
```

Edit the `.env` file with your MySQL credentials:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root                    # or your created user
DB_PASSWORD=your_password       # your MySQL password
DB_NAME=certificate_app
DB_PORT=3306
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Application

The database tables will be created automatically when you start the server:

```bash
npm run server
```

## Database Schema

The application will automatically create two tables:

### Users Table
- `id` - Auto-incrementing primary key
- `name` - User's full name
- `email` - Unique email address
- `certificate_data` - JSON data for certificates
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

### Certificates Table
- `id` - Auto-incrementing primary key
- `user_id` - Foreign key referencing users table
- `certificate_type` - Type of certificate
- `recipient_name` - Name of certificate recipient
- `issue_date` - Date when certificate was issued
- `certificate_data` - Certificate data
- `file_path` - Path to certificate file
- `created_at` - Timestamp when record was created

## Troubleshooting

### Connection Issues
- Ensure MySQL server is running
- Verify the database credentials in your `.env` file
- Check that the database `certificate_app` exists

### Permission Issues
- Make sure your MySQL user has the necessary privileges
- For root user, ensure the password is correct

### Port Issues
- Default MySQL port is 3306, change in `.env` if different

## Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Navigate to the `certificate_app` database
4. You can view and manage the tables through the GUI
5. Use the query editor to run SQL commands

## Migration from SQLite

If you have existing data in SQLite, you'll need to:
1. Export data from SQLite tables
2. Import the data into MySQL tables
3. Ensure data types are compatible

The application will automatically create the new MySQL tables when started. 