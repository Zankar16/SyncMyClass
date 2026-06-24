const express = require('express');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all faculty members
router.get('/faculty', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [faculty] = await pool.query(
      'SELECT id, name, email, department FROM faculty',
      []
    );
    res.json(faculty);
  } catch (err) {
    console.error('Get faculty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new poll
router.post('/polls', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { prompt, facultyIds } = req.body;
    const adminId = req.user.id;

    if (!prompt || !facultyIds || facultyIds.length < 2) {
      return res.status(400).json({ message: 'Prompt and at least 2 faculty members required.' });
    }

    // Set expiry to 5 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    const [result] = await pool.query(
      'INSERT INTO polls (prompt, created_by, expires_at) VALUES (?, ?, ?)',
      [prompt, adminId, expiresAt]
    );

    const pollId = result.insertId;

    // Insert faculty as poll options
    const optionValues = facultyIds.map(fid => [pollId, fid]);
    await pool.query(
      'INSERT INTO poll_options (poll_id, faculty_id) VALUES ?',
      [optionValues]
    );

    res.status(201).json({ message: 'Poll created successfully!', pollId });
  } catch (err) {
    console.error('Create poll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Allocate top-voted faculty for an expired poll
router.post('/allocate/:pollId', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const pollId = req.params.pollId;

    // Check poll exists and is expired
    const [poll] = await pool.query('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (poll.length === 0) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    // Check if already allocated
    const [existingAllocation] = await pool.query(
      'SELECT * FROM allocations WHERE poll_id = ?',
      [pollId]
    );
    if (existingAllocation.length > 0) {
      return res.status(400).json({ message: 'Faculty already allocated for this poll.' });
    }

    // Get faculty with most votes
    const [results] = await pool.query(`
      SELECT po.faculty_id, COUNT(v.id) AS votes
      FROM poll_options po
      LEFT JOIN votes v ON po.id = v.option_id
      WHERE po.poll_id = ?
      GROUP BY po.faculty_id
      ORDER BY votes DESC
      LIMIT 1
    `, [pollId]);

    if (results.length === 0 || results[0].votes === 0) {
      return res.status(400).json({ message: 'No votes cast for this poll.' });
    }

    const topFacultyId = results[0].faculty_id;

    // Insert allocation
    await pool.query(
      'INSERT INTO allocations (poll_id, faculty_id) VALUES (?, ?)',
      [pollId, topFacultyId]
    );

    // Get faculty name for response
    const [faculty] = await pool.query('SELECT name FROM faculty WHERE id = ?', [topFacultyId]);

    res.json({
      message: `Faculty "${faculty[0].name}" has been allocated!`,
      allocation: { poll_id: pollId, faculty_id: topFacultyId, faculty_name: faculty[0].name }
    });
  } catch (err) {
    console.error('Allocate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all allocations
router.get('/allocations', verifyToken, async (req, res) => {
  try {
    const [allocations] = await pool.query(`
      SELECT a.id, a.poll_id, a.faculty_id, a.allocated_at,
             p.prompt, u.name as faculty_name, u.department as faculty_department
      FROM allocations a
      JOIN polls p ON a.poll_id = p.id
      JOIN faculty u ON a.faculty_id = u.id
      ORDER BY a.allocated_at DESC
    `);
    res.json(allocations);
  } catch (err) {
    console.error('Get allocations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all polls (for admin management, includes expired)
router.get('/polls', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.prompt, p.expires_at, p.created_at,
             po.id as option_id, u.id as faculty_id, u.name as faculty_name, u.department as faculty_department,
             (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) as total_votes
      FROM polls p
      JOIN poll_options po ON p.id = po.poll_id
      JOIN faculty u ON po.faculty_id = u.id
      ORDER BY p.created_at DESC
    `);

    const pollsMap = {};
    rows.forEach(row => {
      if (!pollsMap[row.id]) {
        pollsMap[row.id] = {
          id: row.id,
          prompt: row.prompt,
          expires_at: row.expires_at,
          created_at: row.created_at,
          total_votes: row.total_votes,
          isExpired: new Date(row.expires_at) <= new Date(),
          options: []
        };
      }
      pollsMap[row.id].options.push({
        option_id: row.option_id,
        faculty_id: row.faculty_id,
        faculty_name: row.faculty_name,
        faculty_department: row.faculty_department
      });
    });

    res.json(Object.values(pollsMap));
  } catch (err) {
    console.error('Admin get polls error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
