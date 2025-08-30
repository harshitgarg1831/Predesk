const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// GET /api/projects - Get all projects with optional skill filtering
router.get('/', async (req, res) => {
  try {
    const { skill } = req.query;
    const connection = await pool.getConnection();
    
    let query = `
      SELECT DISTINCT p.*, 
             GROUP_CONCAT(s.name) as skills
      FROM projects p
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN skills s ON ps.skill_id = s.id
    `;
    
    const queryParams = [];
    
    if (skill) {
      query += ` WHERE s.name LIKE ?`;
      queryParams.push(`%${skill}%`);
    }
    
    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;
    
    const [projectRows] = await connection.execute(query, queryParams);
    
    // Format the response
    const projects = projectRows.map(project => ({
      ...project,
      skills: project.skills ? project.skills.split(',') : []
    }));
    
    connection.release();
    res.json(projects);
    
  } catch (error) {
    console.error('Projects GET error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get specific project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Get project details
    const [projectRows] = await connection.execute(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (projectRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectRows[0];
    
    // Get project skills
    const [skillRows] = await connection.execute(`
      SELECT s.* FROM skills s
      JOIN project_skills ps ON s.id = ps.skill_id
      WHERE ps.project_id = ?
      ORDER BY s.name ASC
    `, [id]);
    
    connection.release();
    
    res.json({
      ...project,
      skills: skillRows
    });
    
  } catch (error) {
    console.error('Project GET error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const { title, description, github_link, live_link, image_url, skill_ids } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Create project
    const [result] = await connection.execute(`
      INSERT INTO projects (title, description, github_link, live_link, image_url)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, github_link, live_link, image_url]);
    
    const projectId = result.insertId;
    
    // Link skills to project
    if (Array.isArray(skill_ids) && skill_ids.length > 0) {
      for (const skillId of skill_ids) {
        await connection.execute(
          'INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)',
          [projectId, skillId]
        );
      }
    }
    
    connection.release();
    
    res.status(201).json({
      id: projectId,
      title,
      description,
      github_link,
      live_link,
      image_url
    });
    
  } catch (error) {
    console.error('Project POST error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, github_link, live_link, image_url, skill_ids } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if project exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Update project
    await connection.execute(`
      UPDATE projects 
      SET title = ?, description = ?, github_link = ?, live_link = ?, image_url = ?
      WHERE id = ?
    `, [title, description, github_link, live_link, image_url, id]);
    
    // Update project skills
    if (Array.isArray(skill_ids)) {
      // Clear existing skills
      await connection.execute('DELETE FROM project_skills WHERE project_id = ?', [id]);
      
      // Add new skills
      for (const skillId of skill_ids) {
        await connection.execute(
          'INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)',
          [id, skillId]
        );
      }
    }
    
    connection.release();
    
    res.json({ message: 'Project updated successfully' });
    
  } catch (error) {
    console.error('Project PUT error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Check if project exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete project (cascade will handle project_skills)
    await connection.execute('DELETE FROM projects WHERE id = ?', [id]);
    
    connection.release();
    
    res.json({ message: 'Project deleted successfully' });
    
  } catch (error) {
    console.error('Project DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
