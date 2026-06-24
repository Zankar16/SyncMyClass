const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
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

    const name = 'Admin User';
    const email = 'admin@pdeu.ac.in';
    const password = 'admin123'; // change this!

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)';
    const params = [name, email, hashedPassword];

    const [result] = await conn.query(query, params);

    console.log(`✅ Admin created successfully:
Name: ${name}
Email: ${email}
Password: ${password}
Database ID: ${result.insertId}`);

    conn.release();
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Admin with this email already exists.');
    } else {
      console.error('❌ Error creating admin:', err);
    }
    process.exit(1);
  }
}

createAdmin();