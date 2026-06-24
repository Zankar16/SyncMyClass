const express = require('express');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', verifyToken, async (req, res) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM subjects ORDER BY created_at DESC');
    res.json(subjects);
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Add a new subject
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { code, name, credits, max_seats, schedule_info } = req.body;
    
    if (!code || !name || credits == null || max_seats == null) {
      return res.status(400).json({ message: 'Missing required subject fields.' });
    }

    const [result] = await pool.query(
      'INSERT INTO subjects (code, name, credits, max_seats, remaining_seats, schedule_info) VALUES (?, ?, ?, ?, ?, ?)',
      [code, name, credits, max_seats, max_seats, schedule_info || null]
    );

    res.status(201).json({ message: 'Subject added successfully', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subject code already exists.' });
    }
    console.error('Add subject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Register for a subject (Handles Queue / Concurrency)
router.post('/:id/register', verifyToken, requireRole('student'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const subjectId = req.params.id;
    const studentId = req.user.id;

    // 1. Check if already registered or waitlisted
    const [existingReg] = await connection.query(
      'SELECT status FROM subject_registrations WHERE student_id = ? AND subject_id = ?',
      [studentId, subjectId]
    );

    if (existingReg.length > 0) {
      if (existingReg[0].status === 'dropped') {
        // Can re-register, we will delete the old 'dropped' record or update it later
        await connection.query('DELETE FROM subject_registrations WHERE student_id = ? AND subject_id = ?', [studentId, subjectId]);
      } else {
        await connection.rollback();
        return res.status(400).json({ message: `You are already ${existingReg[0].status} for this subject.` });
      }
    }

    // 2. Concurrency Queue: Lock the subject row for update. This strictly serializes concurrent requests for the same subject.
    const [subjects] = await connection.query(
      'SELECT * FROM subjects WHERE id = ? FOR UPDATE',
      [subjectId]
    );

    if (subjects.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Subject not found.' });
    }

    const subject = subjects[0];
    if (!subject.is_open) {
      await connection.rollback();
      return res.status(400).json({ message: 'Registration for this subject is closed.' });
    }

    // 3. Check Credit Limit (Let's assume default max is 20 credits)
    const MAX_CREDITS = 20;
    const [currentCreditsResult] = await connection.query(
      `SELECT SUM(s.credits) as total_credits 
       FROM subject_registrations sr 
       JOIN subjects s ON sr.subject_id = s.id 
       WHERE sr.student_id = ? AND sr.status = 'enrolled'`,
      [studentId]
    );
    const currentCredits = parseInt(currentCreditsResult[0].total_credits || 0);

    if (currentCredits + subject.credits > MAX_CREDITS) {
      await connection.rollback();
      return res.status(400).json({ message: `Credit limit exceeded. You have ${currentCredits}/${MAX_CREDITS} credits.` });
    }

    // 4. Determine Enrolled vs Waitlisted
    let statusToSet = 'waitlisted';
    if (subject.remaining_seats > 0) {
      statusToSet = 'enrolled';
      // Decrement seats
      await connection.query(
        'UPDATE subjects SET remaining_seats = remaining_seats - 1 WHERE id = ?',
        [subjectId]
      );
    }

    // 5. Insert Registration
    await connection.query(
      'INSERT INTO subject_registrations (student_id, subject_id, status) VALUES (?, ?, ?)',
      [studentId, subjectId, statusToSet]
    );

    await connection.commit();
    res.json({ message: statusToSet === 'enrolled' ? 'Successfully registered!' : 'Subject full. You have been placed on the waitlist.' });
  } catch (err) {
    await connection.rollback();
    console.error('Register subject error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Student: Drop a subject
router.post('/:id/drop', verifyToken, requireRole('student'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const subjectId = req.params.id;
    const studentId = req.user.id;

    // 1. Get the registration
    const [registrations] = await connection.query(
      'SELECT id, status FROM subject_registrations WHERE student_id = ? AND subject_id = ? AND status != "dropped" FOR UPDATE',
      [studentId, subjectId]
    );

    if (registrations.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'You are not active in this subject.' });
    }

    const currentStatus = registrations[0].status;

    // 2. Mark as dropped
    await connection.query(
      'UPDATE subject_registrations SET status = "dropped" WHERE id = ?',
      [registrations[0].id]
    );

    // 3. Queue processing if the student was 'enrolled'
    if (currentStatus === 'enrolled') {
      // Find the absolute oldest waitlisted student for this subject
      const [waitlist] = await connection.query(
        'SELECT id, student_id FROM subject_registrations WHERE subject_id = ? AND status = "waitlisted" ORDER BY created_at ASC LIMIT 1 FOR UPDATE',
        [subjectId]
      );

      if (waitlist.length > 0) {
        // Upgrade them to enrolled
        await connection.query(
          'UPDATE subject_registrations SET status = "enrolled" WHERE id = ?',
          [waitlist[0].id]
        );
        // Do not increment remaining_seats since the seat was consumed immediately
        // Note: Can also dispatch system notification to the waitlisted student here
      } else {
        // No one in waitlist, just free up the seat
        await connection.query(
          'UPDATE subjects SET remaining_seats = remaining_seats + 1 WHERE id = ?',
          [subjectId]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Subject dropped successfully.' });
  } catch (err) {
    await connection.rollback();
    console.error('Drop subject error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get registrations for currentUser
router.get('/my-registrations', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.query(
      `SELECT sr.id as reg_id, sr.status, sr.created_at as reg_date, s.* 
       FROM subject_registrations sr 
       JOIN subjects s ON sr.subject_id = s.id 
       WHERE sr.student_id = ? AND sr.status != 'dropped'
       ORDER BY sr.created_at DESC`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my registrations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
