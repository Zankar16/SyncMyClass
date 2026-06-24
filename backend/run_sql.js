const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const schemaSql = fs.readFileSync('schema.sql', 'utf8');
    console.log('Running schema.sql...');
    await connection.query(schemaSql);
    
    // Switch to database
    await connection.query('USE ' + (process.env.DB_NAME || 'voting_system'));

    const seedSql = fs.readFileSync('seed.sql', 'utf8');
    console.log('Running seed.sql...');
    await connection.query(seedSql);

    console.log('DB setup complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

run();
