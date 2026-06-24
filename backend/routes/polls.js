const express = require('express');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all active polls (with faculty options)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.prompt, p.expires_at, p.created_at,
             po.id as option_id,
             f.id as faculty_id,
             f.name as faculty_name,
             f.department as faculty_department
      FROM polls p
      JOIN poll_options po ON p.id = po.poll_id
      JOIN faculty f ON po.faculty_id = f.id
      WHERE p.expires_at > NOW()
      ORDER BY p.created_at DESC
    `);

    const [userVotes] = await pool.query(
      'SELECT poll_id, option_id FROM votes WHERE student_id = ?',
      [req.user.id]
    );

    const votedMap = {};
    userVotes.forEach(v => { votedMap[v.poll_id] = v.option_id; });

    const pollsMap = {};
    rows.forEach(row => {
      if (!pollsMap[row.id]) {
        pollsMap[row.id] = {
          id: row.id,
          prompt: row.prompt,
          expires_at: row.expires_at,
          created_at: row.created_at,
          hasVoted: !!votedMap[row.id],
          votedOptionId: votedMap[row.id] || null,
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
    console.error('Get polls error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expired polls
router.get('/expired', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.prompt, p.expires_at, p.created_at,
             po.id as option_id,
             f.id as faculty_id,
             f.name as faculty_name,
             f.department as faculty_department
      FROM polls p
      JOIN poll_options po ON p.id = po.poll_id
      JOIN faculty f ON po.faculty_id = f.id
      WHERE p.expires_at <= NOW()
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
    console.error('Get expired polls error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single poll detail
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const pollId = req.params.id;

    const [rows] = await pool.query(`
      SELECT p.id, p.prompt, p.expires_at, p.created_at,
             po.id as option_id,
             f.id as faculty_id,
             f.name as faculty_name,
             f.department as faculty_department
      FROM polls p
      JOIN poll_options po ON p.id = po.poll_id
      JOIN faculty f ON po.faculty_id = f.id
      WHERE p.id = ?
    `, [pollId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    const [userVote] = await pool.query(
      'SELECT option_id FROM votes WHERE student_id = ? AND poll_id = ?',
      [req.user.id, pollId]
    );

    const poll = {
      id: rows[0].id,
      prompt: rows[0].prompt,
      expires_at: rows[0].expires_at,
      created_at: rows[0].created_at,
      isExpired: new Date(rows[0].expires_at) <= new Date(),
      hasVoted: userVote.length > 0,
      votedOptionId: userVote.length > 0 ? userVote[0].option_id : null,
      options: rows.map(r => ({
        option_id: r.option_id,
        faculty_id: r.faculty_id,
        faculty_name: r.faculty_name,
        faculty_department: r.faculty_department
      }))
    };

    res.json(poll);
  } catch (err) {
    console.error('Get poll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on a poll (students only)
router.post('/:id/vote', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const pollId = req.params.id;
    const studentId = req.user.id;
    const { option_id } = req.body;

    if (!option_id) {
      return res.status(400).json({ message: 'Option ID is required.' });
    }

    const [poll] = await pool.query(
      'SELECT * FROM polls WHERE id = ? AND expires_at > NOW()',
      [pollId]
    );

    if (poll.length === 0) {
      return res.status(400).json({ message: 'Poll not found or has expired.' });
    }

    const [option] = await pool.query(
      'SELECT * FROM poll_options WHERE id = ? AND poll_id = ?',
      [option_id, pollId]
    );

    if (option.length === 0) {
      return res.status(400).json({ message: 'Invalid option for this poll.' });
    }

    const [existingVote] = await pool.query(
      'SELECT * FROM votes WHERE student_id = ? AND poll_id = ?',
      [studentId, pollId]
    );

    if (existingVote.length > 0) {
      return res.status(400).json({ message: 'You have already voted on this poll.' });
    }

    await pool.query(
      'INSERT INTO votes (student_id, poll_id, option_id) VALUES (?, ?, ?)',
      [studentId, pollId, option_id]
    );

    res.json({ message: 'Vote recorded successfully!' });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get poll results
router.get('/:id/results', verifyToken, async (req, res) => {
  try {
    const pollId = req.params.id;

    const [pollInfo] = await pool.query(
      'SELECT * FROM polls WHERE id = ?',
      [pollId]
    );

    if (pollInfo.length === 0) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    const [results] = await pool.query(`
      SELECT po.id as option_id,
             f.id as faculty_id,
             f.name AS faculty_name,
             f.department AS faculty_department,
             COUNT(v.id) AS votes
      FROM poll_options po
      JOIN faculty f ON po.faculty_id = f.id
      LEFT JOIN votes v ON po.id = v.option_id
      WHERE po.poll_id = ?
      GROUP BY po.id, f.id, f.name, f.department
      ORDER BY votes DESC
    `, [pollId]);

    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

    const [allocation] = await pool.query(`
      SELECT a.*, f.name as faculty_name
      FROM allocations a
      JOIN faculty f ON a.faculty_id = f.id
      WHERE a.poll_id = ?
    `, [pollId]);

    res.json({
      poll: pollInfo[0],
      results: results.map(r => ({
        ...r,
        percentage: totalVotes > 0
          ? Math.round((r.votes / totalVotes) * 100)
          : 0
      })),
      totalVotes,
      allocation: allocation.length > 0 ? allocation[0] : null
    });
  } catch (err) {
    console.error('Results error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;