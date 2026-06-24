const express = require('express');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET notifications for the logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin' || userRole === 'faculty') {
      let query = `
        SELECT n.*, 
               (SELECT JSON_ARRAYAGG(JSON_OBJECT('type', target_type, 'value', target_value)) FROM notification_targets WHERE notification_id = n.id) as targets
        FROM notifications n
      `;
      let params = [];
      if (userRole === 'faculty') {
        query += ` WHERE n.created_by = ?`;
        params.push(userId);
      }
      query += ` ORDER BY n.created_at DESC`;

      const [notifications] = await pool.query(query, params);
      return res.json(notifications);
    }

    // For students, fetch their specific details first
    const [users] = await pool.query('SELECT * FROM students WHERE id = ?', [userId]);
    const student = users[0];

    if (!student) return res.status(404).json({ message: 'User not found' });

    const query = `
      SELECT DISTINCT n.*, 
             IF(nr.read_at IS NULL, false, true) as is_read
      FROM notifications n
      JOIN notification_targets nt ON n.id = nt.notification_id
      LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.student_id = ?
      WHERE nt.target_type = 'all'
         OR (nt.target_type = 'student' AND nt.target_value = ?)
         OR (nt.target_type = 'branch' AND nt.target_value = ?)
         OR (nt.target_type = 'batch' AND nt.target_value = ?)
         OR (nt.target_type = 'year' AND nt.target_value = ?)
      ORDER BY n.created_at DESC
    `;
    const params = [
      userId,
      student.id.toString(),
      student.branch || '',
      student.batch || '',
      student.year || ''
    ];

    const [notifications] = await pool.query(query, params);
    
    // Convert is_read to boolean
    const formatted = notifications.map(n => ({
      ...n,
      is_read: !!n.is_read
    }));

    res.json(formatted);

  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create notification
router.post('/', verifyToken, requireRole('admin', 'faculty'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { title, message, priority, targets } = req.body;

    if (!title || !message || !targets || targets.length === 0) {
      return res.status(400).json({ message: 'Title, message, and targets are required.' });
    }

    const [notifResult] = await connection.query(
      'INSERT INTO notifications (title, message, priority, created_by) VALUES (?, ?, ?, ?)',
      [title, message, priority || 'normal', req.user.id]
    );
    const notificationId = notifResult.insertId;

    for (const target of targets) {
      await connection.query(
        'INSERT INTO notification_targets (notification_id, target_type, target_value) VALUES (?, ?, ?)',
        [notificationId, target.type, target.value ? target.value.toString() : null]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Notification sent successfully', id: notificationId });
  } catch (err) {
    await connection.rollback();
    console.error('Create notification error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// PUT mark as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'INSERT IGNORE INTO notification_reads (notification_id, student_id) VALUES (?, ?)',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
