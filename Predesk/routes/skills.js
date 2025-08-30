const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// GET /api/skills - Get all skills
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [skillRows] = await connection.execute(`
      SELECT s.*, COUNT(ps.project_id) as project_count
      FROM skills s
      LEFT JOIN project_skills ps ON s.id = ps.skill_id
      GROUP BY s.id
      ORDER BY s.proficiency_level DESC, s.name ASC
    `);
    
    connection.release();
    res.json(skillRows);
    
  } catch (error) {
    console.error('Skills GET error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/skills/top - Get top skills by project count
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const connection = await pool.getConnection();
    
    const [skillRows] = await connection.execute(`
      SELECT s.*, COUNT(ps.project_id) as project_count
      FROM skills s
      LEFT JOIN project_skills ps ON s.id = ps.skill_id
      GROUP BY s.id
      ORDER BY project_count DESC, s.proficiency_level DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    connection.release();
    res.json(skillRows);
    
  } catch (error) {
    console.error('Top skills GET error:', error);
    res.status(500).json({ error: 'Failed to fetch top skills' });
  }
});

// GET /api/skills/:id - Get specific skill
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const [skillRows] = await connection.execute(
      'SELECT * FROM skills WHERE id = ?',
      [id]
    );
    
    if (skillRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Get projects using this skill
    const [projectRows] = await connection.execute(`
      SELECT p.* FROM projects p
      JOIN project_skills ps ON p.id = ps.project_id
      WHERE ps.skill_id = ?
      ORDER BY p.created_at DESC
    `, [id]);
    
    connection.release();
    
    res.json({
      ...skillRows[0],
      projects: projectRows
    });
    
  } catch (error) {
    console.error('Skill GET error:', error);
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

// POST /api/skills - Create new skill
router.post('/', async (req, res) => {
  try {
    const { name, proficiency_level, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if skill already exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM skills WHERE name = ?',
      [name]
    );
    
    if (existingRows.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Skill already exists' });
    }
    
    // Create skill
    const [result] = await connection.execute(`
      INSERT INTO skills (name, proficiency_level, category)
      VALUES (?, ?, ?)
    `, [name, proficiency_level || 'intermediate', category]);
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      name,
      proficiency_level: proficiency_level || 'intermediate',
      category
    });
    
  } catch (error) {
    console.error('Skill POST error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// PUT /api/skills/:id - Update skill
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, proficiency_level, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if skill exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM skills WHERE id = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Check if new name conflicts with existing skill
    if (name !== existingRows[0].name) {
      const [nameConflictRows] = await connection.execute(
        'SELECT id FROM skills WHERE name = ? AND id != ?',
        [name, id]
      );
      
      if (nameConflictRows.length > 0) {
        connection.release();
        return res.status(409).json({ error: 'Skill name already exists' });
      }
    }
    
    // Update skill
    await connection.execute(`
      UPDATE skills 
      SET name = ?, proficiency_level = ?, category = ?
      WHERE id = ?
    `, [name, proficiency_level, category, id]);
    
    connection.release();
    
    res.json({ message: 'Skill updated successfully' });
    
  } catch (error) {
    console.error('Skill PUT error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// DELETE /api/skills/:id - Delete skill
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    // Check if skill exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM skills WHERE id = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Delete skill (cascade will handle project_skills and profile_skills)
    await connection.execute('DELETE FROM skills WHERE id = ?', [id]);
    
    connection.release();
    
    res.json({ message: 'Skill deleted successfully' });
    
  } catch (error) {
    console.error('Skill DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

module.exports = router;
