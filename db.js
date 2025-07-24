const mysql = require('mysql2/promise');
const path = require('path');

let connection;

const connectDatabase = async () => {
  try {
    // MySQL connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'certificate_app',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    // Create connection pool
    connection = mysql.createPool(dbConfig);
    
    // Test the connection
    await connection.getConnection();
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
};

const initializeDatabase = async () => {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        certificate_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createCertificatesTable = `
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        certificate_type VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        issue_date VARCHAR(255) NOT NULL,
        certificate_data TEXT,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    const createCoursesTable = `
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(255) NOT NULL
      )
    `;

    // Execute table creation queries
    await connection.execute(createUsersTable);
    console.log('Users table created or already exists');

    await connection.execute(createCertificatesTable);
    console.log('Certificates table created or already exists');

    await connection.execute(createCoursesTable);
    console.log('Courses table created or already exists');

    // Insert sample courses if table is empty
    const [existingCourses] = await connection.execute('SELECT COUNT(*) as count FROM courses');
    if (existingCourses[0].count === 0) {
      const sampleCourses = [
        'E-Commerce Web Development',
        'Front-End Web Development',
        'Full Stack Web Development',
        'Software Test Automation with Selenium',
        'Quality Assurance Fundamentals'
      ];
      
      for (const courseName of sampleCourses) {
        await connection.execute('INSERT INTO courses (course_name) VALUES (?)', [courseName]);
      }
      console.log('Sample courses inserted successfully');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
};

const getDatabase = () => {
  return connection;
};

module.exports = {
  connectDatabase,
  initializeDatabase,
  getDatabase
}; 