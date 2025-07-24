-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL
);

-- Insert sample courses
INSERT INTO courses (course_name) VALUES
('E-Commerce Web Development'),
('Front-End Web Development'),
('Full Stack Web Development'),
('Software Test Automation with Selenium'),
('Quality Assurance Fundamentals'); 