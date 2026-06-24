const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'voting_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to DB');

    // Add branch, batch, year to users if they don't exist
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN branch VARCHAR(100), ADD COLUMN batch VARCHAR(50), ADD COLUMN year VARCHAR(50)`);
      console.log('✅ Added branch, batch, year to users.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Columns already exist in users.');
      } else {
        throw err;
      }
    }

    // Create notifications table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('normal', 'important', 'urgent') DEFAULT 'normal',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notifications table.');

    // Create notification_targets table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notification_targets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id INT NOT NULL,
        target_type ENUM('student', 'branch', 'batch', 'year', 'all') NOT NULL,
        target_value VARCHAR(100),
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notification_targets table.');

    // Create notification_reads table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notification_reads (
        notification_id INT NOT NULL,
        student_id INT NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (notification_id, student_id),
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notification_reads table.');

    conn.release();
    console.log('✅ Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
