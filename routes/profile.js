const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// GET /api/profile - Get profile information
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get profile data
    const [profileRows] = await connection.execute('SELECT * FROM profiles LIMIT 1');
    
    if (profileRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const profile = profileRows[0];
    
    // Get profile skills
    const [skillRows] = await connection.execute(`
      SELECT s.* FROM skills s
      JOIN profile_skills ps ON s.id = ps.skill_id
      WHERE ps.profile_id = ?
      ORDER BY s.proficiency_level DESC, s.name ASC
    `, [profile.id]);
    
    // Get work experience
    const [workRows] = await connection.execute(`
      SELECT * FROM work_experience 
      ORDER BY start_date DESC
    `);
    
    connection.release();
    
    res.json({
      ...profile,
      skills: skillRows,
      work_experience: workRows
    });
    
  } catch (error) {
    console.error('Profile GET error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/profile - Create new profile
router.post('/', async (req, res) => {
  try {
    const { name, email, education, github_link, linkedin_link, portfolio_link } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if profile already exists
    const [existingRows] = await connection.execute('SELECT id FROM profiles LIMIT 1');
    if (existingRows.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Profile already exists' });
    }
    
    // Create profile
    const [result] = await connection.execute(`
      INSERT INTO profiles (name, email, education, github_link, linkedin_link, portfolio_link)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, education, github_link, linkedin_link, portfolio_link]);
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      education,
      github_link,
      linkedin_link,
      portfolio_link
    });
    
  } catch (error) {
    console.error('Profile POST error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PUT /api/profile - Update profile
router.put('/', async (req, res) => {
  try {
    const { name, email, education, github_link, linkedin_link, portfolio_link } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if profile exists
    const [existingRows] = await connection.execute('SELECT id FROM profiles LIMIT 1');
    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Update profile
    await connection.execute(`
      UPDATE profiles 
      SET name = ?, email = ?, education = ?, github_link = ?, linkedin_link = ?, portfolio_link = ?
      WHERE id = ?
    `, [name, email, education, github_link, linkedin_link, portfolio_link, existingRows[0].id]);
    
    connection.release();
    
    res.json({ message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Profile PUT error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/skills - Add skills to profile
router.post('/skills', async (req, res) => {
  try {
    const { skill_ids } = req.body;
    
    if (!Array.isArray(skill_ids) || skill_ids.length === 0) {
      return res.status(400).json({ error: 'Skill IDs array is required' });
    }
    
    const connection = await pool.getConnection();
    
    // Get profile ID
    const [profileRows] = await connection.execute('SELECT id FROM profiles LIMIT 1');
    if (profileRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const profileId = profileRows[0].id;
    
    // Clear existing profile skills
    await connection.execute('DELETE FROM profile_skills WHERE profile_id = ?', [profileId]);
    
    // Add new skills
    for (const skillId of skill_ids) {
      await connection.execute(
        'INSERT INTO profile_skills (profile_id, skill_id) VALUES (?, ?)',
        [profileId, skillId]
      );
    }
    
    connection.release();
    
    res.json({ message: 'Profile skills updated successfully' });
    
  } catch (error) {
    console.error('Profile skills POST error:', error);
    res.status(500).json({ error: 'Failed to update profile skills' });
  }
});

module.exports = router;
