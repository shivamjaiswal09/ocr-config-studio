const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runOCRMigration() {
  const dbName = process.env.DB_NAME || 'pdf_template_engine';
  
  // First, connect to postgres database to create our target database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    // Create database if it doesn't exist
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await adminPool.query(`CREATE DATABASE ${dbName}`).catch(() => {
      console.log('Database already exists, continuing...');
    });
  } catch (error) {
    console.log('Database creation skipped:', error.message);
  } finally {
    await adminPool.end();
  }

  // Now connect to our target database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: dbName,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    console.log('Running OCR tables migration...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'create-ocr-tables.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ OCR tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runOCRMigration();

