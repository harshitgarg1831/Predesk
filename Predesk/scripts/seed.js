const { pool } = require('../config/database');

const sampleData = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    education: 'Bachelor of Science in Computer Science, University of Technology, 2020',
    github_link: 'https://github.com/johndoe',
    linkedin_link: 'https://linkedin.com/in/johndoe',
    portfolio_link: 'https://johndoe.dev'
  },
  
  skills: [
    { name: 'JavaScript', proficiency_level: 'expert', category: 'Programming' },
    { name: 'Python', proficiency_level: 'advanced', category: 'Programming' },
    { name: 'React', proficiency_level: 'advanced', category: 'Frontend' },
    { name: 'Node.js', proficiency_level: 'advanced', category: 'Backend' },
    { name: 'MySQL', proficiency_level: 'intermediate', category: 'Database' },
    { name: 'Docker', proficiency_level: 'intermediate', category: 'DevOps' },
    { name: 'Git', proficiency_level: 'expert', category: 'Tools' },
    { name: 'TypeScript', proficiency_level: 'intermediate', category: 'Programming' }
  ],
  
  projects: [
    {
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce application built with React, Node.js, and MySQL. Features include user authentication, product management, shopping cart, and payment integration.',
      github_link: 'https://github.com/johndoe/ecommerce',
      live_link: 'https://ecommerce-demo.johndoe.dev',
      image_url: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=E-Commerce'
    },
    {
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      github_link: 'https://github.com/johndoe/task-manager',
      live_link: 'https://tasks.johndoe.dev',
      image_url: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Task+Manager'
    },
    {
      title: 'Weather Dashboard',
      description: 'A weather application that displays current weather conditions and forecasts using OpenWeatherMap API with beautiful charts and responsive design.',
      github_link: 'https://github.com/johndoe/weather-app',
      live_link: 'https://weather.johndoe.dev',
      image_url: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Weather+App'
    },
    {
      title: 'Portfolio Website',
      description: 'A responsive portfolio website showcasing projects, skills, and professional experience with modern design and smooth animations.',
      github_link: 'https://github.com/johndoe/portfolio',
      live_link: 'https://johndoe.dev',
      image_url: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Portfolio'
    }
  ],
  
  workExperience: [
    {
      company: 'Tech Solutions Inc.',
      position: 'Senior Full Stack Developer',
      description: 'Led development of multiple web applications using React, Node.js, and MySQL. Mentored junior developers and implemented CI/CD pipelines.',
      start_date: '2022-01-01',
      end_date: null,
      current_job: true
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      description: 'Developed responsive user interfaces and implemented modern web technologies. Collaborated with design and backend teams.',
      start_date: '2020-06-01',
      end_date: '2021-12-31',
      current_job: false
    }
  ]
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const connection = await pool.getConnection();
    
    // Clear existing data
    await connection.execute('DELETE FROM project_skills');
    await connection.execute('DELETE FROM profile_skills');
    await connection.execute('DELETE FROM work_experience');
    await connection.execute('DELETE FROM projects');
    await connection.execute('DELETE FROM skills');
    await connection.execute('DELETE FROM profiles');
    
    console.log('🧹 Cleared existing data');
    
    // Insert profile
    const [profileResult] = await connection.execute(
      'INSERT INTO profiles (name, email, education, github_link, linkedin_link, portfolio_link) VALUES (?, ?, ?, ?, ?, ?)',
      [sampleData.profile.name, sampleData.profile.email, sampleData.profile.education, 
       sampleData.profile.github_link, sampleData.profile.linkedin_link, sampleData.profile.portfolio_link]
    );
    const profileId = profileResult.insertId;
    console.log('✅ Profile created');
    
    // Insert skills
    const skillIds = [];
    for (const skill of sampleData.skills) {
      const [skillResult] = await connection.execute(
        'INSERT INTO skills (name, proficiency_level, category) VALUES (?, ?, ?)',
        [skill.name, skill.proficiency_level, skill.category]
      );
      skillIds.push(skillResult.insertId);
    }
    console.log('✅ Skills created');
    
    // Link profile to skills
    for (const skillId of skillIds) {
      await connection.execute(
        'INSERT INTO profile_skills (profile_id, skill_id) VALUES (?, ?)',
        [profileId, skillId]
      );
    }
    console.log('✅ Profile skills linked');
    
    // Insert projects
    const projectIds = [];
    for (const project of sampleData.projects) {
      const [projectResult] = await connection.execute(
        'INSERT INTO projects (title, description, github_link, live_link, image_url) VALUES (?, ?, ?, ?, ?)',
        [project.title, project.description, project.github_link, project.live_link, project.image_url]
      );
      projectIds.push(projectResult.insertId);
    }
    console.log('✅ Projects created');
    
    // Link projects to skills (randomly assign 2-4 skills per project)
    for (let i = 0; i < projectIds.length; i++) {
      const numSkills = Math.floor(Math.random() * 3) + 2; // 2-4 skills
      const shuffledSkills = [...skillIds].sort(() => 0.5 - Math.random());
      const projectSkills = shuffledSkills.slice(0, numSkills);
      
      for (const skillId of projectSkills) {
        await connection.execute(
          'INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)',
          [projectIds[i], skillId]
        );
      }
    }
    console.log('✅ Project skills linked');
    
    // Insert work experience
    for (const work of sampleData.workExperience) {
      await connection.execute(
        'INSERT INTO work_experience (company, position, description, start_date, end_date, current_job) VALUES (?, ?, ?, ?, ?, ?)',
        [work.company, work.position, work.description, work.start_date, work.end_date, work.current_job]
      );
    }
    console.log('✅ Work experience created');
    
    connection.release();
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('✅ All data seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  });
