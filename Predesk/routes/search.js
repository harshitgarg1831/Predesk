const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// GET /api/search - Global search across profiles, projects, and skills
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const connection = await pool.getConnection();
    
    // Search in profiles
    const [profileRows] = await connection.execute(`
      SELECT 'profile' as type, id, name as title, education as description, 
             created_at, 'profile' as category
      FROM profiles 
      WHERE name LIKE ? OR education LIKE ?
    `, [searchTerm, searchTerm]);
    
    // Search in projects
    const [projectRows] = await connection.execute(`
      SELECT 'project' as type, id, title, description, 
             created_at, 'project' as category
      FROM projects 
      WHERE title LIKE ? OR description LIKE ?
    `, [searchTerm, searchTerm]);
    
    // Search in skills
    const [skillRows] = await connection.execute(`
      SELECT 'skill' as type, id, name as title, 
             CONCAT(proficiency_level, ' level ', category, ' skill') as description,
             created_at, category
      FROM skills 
      WHERE name LIKE ? OR category LIKE ? OR proficiency_level LIKE ?
    `, [searchTerm, searchTerm, searchTerm]);
    
    // Search in work experience
    const [workRows] = await connection.execute(`
      SELECT 'work' as type, id, position as title, 
             CONCAT(company, ' - ', description) as description,
             created_at, 'work' as category
      FROM work_experience 
      WHERE company LIKE ? OR position LIKE ? OR description LIKE ?
    `, [searchTerm, searchTerm, searchTerm]);
    
    connection.release();
    
    // Combine and sort results by relevance
    const allResults = [
      ...profileRows.map(p => ({ ...p, relevance: 3 })), // High relevance for profiles
      ...projectRows.map(p => ({ ...p, relevance: 2 })), // Medium relevance for projects
      ...skillRows.map(s => ({ ...s, relevance: 2 })),   // Medium relevance for skills
      ...workRows.map(w => ({ ...w, relevance: 1 }))     // Lower relevance for work
    ];
    
    // Sort by relevance and date
    allResults.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // Remove relevance field from final results
    const results = allResults.map(({ relevance, ...item }) => item);
    
    res.json({
      query: q,
      total_results: results.length,
      results: results.slice(0, 50) // Limit to 50 results
    });
    
  } catch (error) {
    console.error('Search GET error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// GET /api/search/advanced - Advanced search with filters
router.get('/advanced', async (req, res) => {
  try {
    const { q, type, category, skill } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const connection = await pool.getConnection();
    
    let results = [];
    
    // Filter by type if specified
    if (type && ['profile', 'project', 'skill', 'work'].includes(type)) {
      switch (type) {
        case 'profile':
          const [profileRows] = await connection.execute(`
            SELECT 'profile' as type, id, name as title, education as description, 
                   created_at, 'profile' as category
            FROM profiles 
            WHERE name LIKE ? OR education LIKE ?
          `, [searchTerm, searchTerm]);
          results = profileRows;
          break;
          
        case 'project':
          let projectQuery = `
            SELECT DISTINCT p.id, 'project' as type, p.title, p.description, 
                   p.created_at, 'project' as category
            FROM projects p
          `;
          const projectParams = [searchTerm, searchTerm];
          
          if (skill) {
            projectQuery += `
              JOIN project_skills ps ON p.id = ps.project_id
              JOIN skills s ON ps.skill_id = s.id
              WHERE (p.title LIKE ? OR p.description LIKE ?) AND s.name LIKE ?
            `;
            projectParams.push(`%${skill}%`);
          } else {
            projectQuery += ` WHERE p.title LIKE ? OR p.description LIKE ?`;
          }
          
          projectQuery += ` ORDER BY p.created_at DESC`;
          
          const [projectRows] = await connection.execute(projectQuery, projectParams);
          results = projectRows;
          break;
          
        case 'skill':
          let skillQuery = `
            SELECT 'skill' as type, id, name as title, 
                   CONCAT(proficiency_level, ' level ', category, ' skill') as description,
                   created_at, category
            FROM skills 
            WHERE (name LIKE ? OR category LIKE ? OR proficiency_level LIKE ?)
          `;
          const skillParams = [searchTerm, searchTerm, searchTerm];
          
          if (category) {
            skillQuery += ` AND category = ?`;
            skillParams.push(category);
          }
          
          skillQuery += ` ORDER BY proficiency_level DESC, name ASC`;
          
          const [skillRows] = await connection.execute(skillQuery, skillParams);
          results = skillRows;
          break;
          
        case 'work':
          const [workRows] = await connection.execute(`
            SELECT 'work' as type, id, position as title, 
                   CONCAT(company, ' - ', description) as description,
                   created_at, 'work' as category
            FROM work_experience 
            WHERE company LIKE ? OR position LIKE ? OR description LIKE ?
            ORDER BY start_date DESC
          `, [searchTerm, searchTerm, searchTerm]);
          results = workRows;
          break;
      }
    } else {
      // No type filter - search across all types
      const [profileRows] = await connection.execute(`
        SELECT 'profile' as type, id, name as title, education as description, 
               created_at, 'profile' as category
        FROM profiles 
        WHERE name LIKE ? OR education LIKE ?
      `, [searchTerm, searchTerm]);
      
      const [projectRows] = await connection.execute(`
        SELECT 'project' as type, id, title, description, 
               created_at, 'project' as category
        FROM projects 
        WHERE title LIKE ? OR description LIKE ?
      `, [searchTerm, searchTerm]);
      
      const [skillRows] = await connection.execute(`
        SELECT 'skill' as type, id, name as title, 
               CONCAT(proficiency_level, ' level ', category, ' skill') as description,
               created_at, category
        FROM skills 
        WHERE name LIKE ? OR category LIKE ? OR proficiency_level LIKE ?
      `, [searchTerm, searchTerm, searchTerm]);
      
      const [workRows] = await connection.execute(`
        SELECT 'work' as type, id, position as title, 
               CONCAT(company, ' - ', description) as description,
               created_at, 'work' as category
        FROM work_experience 
        WHERE company LIKE ? OR position LIKE ? OR description LIKE ?
      `, [searchTerm, searchTerm, searchTerm]);
      
      results = [...profileRows, ...projectRows, ...skillRows, ...workRows];
    }
    
    connection.release();
    
    // Sort results by date
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      query: q,
      type: type || 'all',
      category: category || 'all',
      skill: skill || 'all',
      total_results: results.length,
      results: results.slice(0, 50) // Limit to 50 results
    });
    
  } catch (error) {
    console.error('Advanced search GET error:', error);
    res.status(500).json({ error: 'Failed to perform advanced search' });
  }
});

module.exports = router;
