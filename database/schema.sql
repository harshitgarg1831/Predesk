CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

CREATE TABLE IF NOT EXISTS profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    education TEXT,
    github_link VARCHAR(500),
    linkedin_link VARCHAR(500),
    portfolio_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    github_link VARCHAR(500),
    live_link VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    current_job BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_skills (
    project_id INT,
    skill_id INT,
    PRIMARY KEY (project_id, skill_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id INT,
    skill_id INT,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

INSERT INTO profiles (name, email, education, github_link, linkedin_link, portfolio_link) VALUES
('Harshit Garg', 'harshitgarg1830@gmail.com', 'B.Tech in Computer Science and Engineering from IIIT Nagpur (2022 - 2026)', 
 'https://github.com/The-harshitg', 'https://www.linkedin.com/in/harshit-garg-649136259/', 'N/A');

INSERT INTO skills (name, proficiency_level, category) VALUES
('C++', 'intermediate', 'Programming'),
('SQL', 'intermediate', 'Programming'),
('JavaScript', 'expert', 'Programming'),
('Node.js', 'advanced', 'Backend'),
('Express.js', 'advanced', 'Backend'),
('MySQL', 'intermediate', 'Database'),
('Git', 'expert', 'Tools'),
('RabbitMQ', 'intermediate', 'Tools'),
('JWT', 'intermediate', 'Security'),
('bcrypt', 'intermediate', 'Security'),
('HTML', 'advanced', 'Frontend');

INSERT INTO projects (title, description, github_link, live_link, image_url) VALUES
('Airline Booking System', 'A microservices-based airline booking backend with 4+ decoupled services and an API Gateway, with JWT authentication, RabbitMQ integration, and MySQL for database management.',
 'https://github.com/HarshitGarg/airline-booking', 'N/A', 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Airline+Booking+System'),
('CollegeHub', 'A role-based college management system with APIs for admissions, grievances, feedback, and academic records using Node.js, Express.js, and MySQL.',
 'https://github.com/HarshitGarg/collegehub', 'N/A', 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=CollegeHub'),
('Hotel Booking System', 'An object-oriented hotel booking application built in C++, utilizing OOP principles like inheritance and polymorphism for room reservations and billing.',
 'https://github.com/HarshitGarg/hotel-booking-system', 'N/A', 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Hotel+Booking+System');

INSERT INTO work_experience (company, position, description, start_date, end_date, current_job) VALUES
('Tech Solutions Inc.', 'Senior Full Stack Developer', 'Led development of multiple web applications using React, Node.js, and MySQL. Mentored junior developers and implemented CI/CD pipelines.', '2022-01-01', NULL, TRUE),
('StartupXYZ', 'Frontend Developer', 'Developed responsive user interfaces and implemented modern web technologies. Collaborated with design and backend teams.', '2020-06-01', '2021-12-31', FALSE);

INSERT INTO profile_skills (profile_id, skill_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11);

INSERT INTO project_skills (project_id, skill_id) VALUES
(1, 1), (1, 2), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
(2, 3), (2, 4), (2, 5), (2, 6), (2, 7),
(3, 1), (3, 2), (3, 10), (3, 11);

CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_proficiency ON skills(proficiency_level);
CREATE INDEX idx_work_experience_dates ON work_experience(start_date, end_date);
CREATE INDEX idx_profile_skills_profile ON profile_skills(profile_id);
CREATE INDEX idx_project_skills_project ON project_skills(project_id);

CREATE VIEW project_skills_view AS
SELECT p.id, p.title, p.description, GROUP_CONCAT(s.name) as skills
FROM projects p
LEFT JOIN project_skills ps ON p.id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.id
GROUP BY p.id;

CREATE VIEW profile_skills_view AS
SELECT pr.id, pr.name, pr.email, GROUP_CONCAT(s.name) as skills
FROM profiles pr
LEFT JOIN profile_skills ps ON pr.id = ps.profile_id
LEFT JOIN skills s ON ps.skill_id = s.id
GROUP BY pr.id;

DELIMITER //
CREATE PROCEDURE SearchPortfolio(IN search_query VARCHAR(255))
BEGIN
    SELECT 'profile' as type, id, name as title, education as description, created_at
    FROM profiles 
    WHERE name LIKE CONCAT('%', search_query, '%') OR education LIKE CONCAT('%', search_query, '%')
    
    UNION ALL
    
    SELECT 'project' as type, id, title, description, created_at
    FROM projects 
    WHERE title LIKE CONCAT('%', search_query, '%') OR description LIKE CONCAT('%', search_query, '%')
    
    UNION ALL
    
    SELECT 'skill' as type, id, name as title, 
           CONCAT(proficiency_level, ' level ', category, ' skill') as description, created_at
    FROM skills 
    WHERE name LIKE CONCAT('%', search_query, '%') OR category LIKE CONCAT('%', search_query, '%')
    
    UNION ALL
    
    SELECT 'work' as type, id, position as title, 
           CONCAT(company, ' - ', description) as description, created_at
    FROM work_experience 
    WHERE company LIKE CONCAT('%', search_query, '%') OR position LIKE CONCAT('%', search_query, '%') 
          OR description LIKE CONCAT('%', search_query, '%')
    
    ORDER BY created_at DESC;
END //
DELIMITER ;

