-- Portfolio Database Schema
-- This file contains the complete database structure for the portfolio application

-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Profiles table - stores user profile information
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

-- Skills table - stores technical skills and competencies
CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table - stores project information
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

-- Work experience table - stores professional work history
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

-- Junction table for projects and skills (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_skills (
    project_id INT,
    skill_id INT,
    PRIMARY KEY (project_id, skill_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Junction table for profiles and skills (many-to-many relationship)
CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id INT,
    skill_id INT,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Sample data for profiles
INSERT INTO profiles (name, email, education, github_link, linkedin_link, portfolio_link) VALUES
('Harshit', 'bt22cse164@iiitn.ac.in', 'B.Tech. in CSE From IIITN', 
 'https://github.com/The-harshitg', 'https://www.linkedin.com/in/harshit-garg-649136259/', 'N/A');

-- Sample data for skills
INSERT INTO skills (name, proficiency_level, category) VALUES
('JavaScript', 'expert', 'Programming'),
('Python', 'advanced', 'Programming'),
('React', 'advanced', 'Frontend'),
('Node.js', 'advanced', 'Backend'),
('MySQL', 'intermediate', 'Database'),
('Docker', 'intermediate', 'DevOps'),
('Git', 'expert', 'Tools'),
('TypeScript', 'intermediate', 'Programming');

-- Sample data for projects
INSERT INTO projects (title, description, github_link, live_link, image_url) VALUES
('E-Commerce Platform', 'A full-stack e-commerce application built with React, Node.js, and MySQL. Features include user authentication, product management, shopping cart, and payment integration.', 
 'https://github.com/johndoe/ecommerce', 'https://ecommerce-demo.johndoe.dev', 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=E-Commerce'),
('Task Management App', 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.', 
 'https://github.com/johndoe/task-manager', 'https://tasks.johndoe.dev', 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Task+Manager'),
('Weather Dashboard', 'A weather application that displays current weather conditions and forecasts using OpenWeatherMap API with beautiful charts and responsive design.', 
 'https://github.com/johndoe/weather-app', 'https://weather.johndoe.dev', 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Weather+App'),
('Portfolio Website', 'A responsive portfolio website showcasing projects, skills, and professional experience with modern design and smooth animations.', 
 'https://github.com/johndoe/portfolio', 'https://johndoe.dev', 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Portfolio');

-- Sample data for work experience
INSERT INTO work_experience (company, position, description, start_date, end_date, current_job) VALUES
('Tech Solutions Inc.', 'Senior Full Stack Developer', 'Led development of multiple web applications using React, Node.js, and MySQL. Mentored junior developers and implemented CI/CD pipelines.', '2022-01-01', NULL, TRUE),
('StartupXYZ', 'Frontend Developer', 'Developed responsive user interfaces and implemented modern web technologies. Collaborated with design and backend teams.', '2020-06-01', '2021-12-31', FALSE);

-- Link profile to skills
INSERT INTO profile_skills (profile_id, skill_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8);

-- Link projects to skills (randomly assign 2-4 skills per project)
INSERT INTO project_skills (project_id, skill_id) VALUES
(1, 1), (1, 3), (1, 4), (1, 5),  -- E-Commerce: JS, React, Node.js, MySQL
(2, 1), (2, 3), (2, 4),          -- Task Manager: JS, React, Node.js
(3, 1), (3, 3), (3, 8),          -- Weather: JS, React, TypeScript
(4, 1), (4, 3), (4, 7);          -- Portfolio: JS, React, Git

-- Create indexes for better performance
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_proficiency ON skills(proficiency_level);
CREATE INDEX idx_work_experience_dates ON work_experience(start_date, end_date);
CREATE INDEX idx_profile_skills_profile ON profile_skills(profile_id);
CREATE INDEX idx_project_skills_project ON project_skills(project_id);

-- Create views for common queries
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

-- Create stored procedure for searching
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
