const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, branch, batch, year, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const [existing] = await pool.query(`
      SELECT email FROM admins WHERE email = ?
      UNION
      SELECT email FROM faculty WHERE email = ?
      UNION
      SELECT email FROM students WHERE email = ?
    `, [email, email, email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow student/faculty registration (admin is seeded)
    const userRole = (role === 'faculty') ? 'faculty' : 'student';

    let result;
    if (userRole === 'faculty') {
      [result] = await pool.query(
        'INSERT INTO faculty (name, email, password, department) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, department || null]
      );
    } else {
      [result] = await pool.query(
        'INSERT INTO students (name, email, password, department, branch, batch, year, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, department || null, branch || null, batch || null, year || null, semester || 1]
      );
    }

    res.status(201).json({ message: 'Registration successful', userId: result.insertId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users] = await pool.query(`
      SELECT id, name, email, password, NULL as department, NULL as branch, NULL as batch, NULL as year, 1 as semester, 'admin' as role FROM admins WHERE email = ?
      UNION
      SELECT id, name, email, password, department, NULL as branch, NULL as batch, NULL as year, 1 as semester, 'faculty' as role FROM faculty WHERE email = ?
      UNION
      SELECT id, name, email, password, department, branch, batch, year, semester, 'student' as role FROM students WHERE email = ?
    `, [email, email, email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        branch: user.branch,
        batch: user.batch,
        year: user.year,
        semester: user.semester
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    let query = '';
    if (req.user.role === 'admin') {
      query = "SELECT id, name, email, NULL as department, 'admin' as role, created_at FROM admins WHERE id = ?";
    } else if (req.user.role === 'faculty') {
      query = "SELECT id, name, email, department, 'faculty' as role, created_at FROM faculty WHERE id = ?";
    } else {
      query = "SELECT id, name, email, department, branch, batch, year, semester, 'student' as role, created_at FROM students WHERE id = ?";
    }
    
    const [users] = await pool.query(query, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(users[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
