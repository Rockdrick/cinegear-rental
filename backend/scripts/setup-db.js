#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mvdassist_equipos',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MVD Assist Equipos database...\n');

    // Read and execute migration
    console.log('📊 Running database migration...');
    const migrationPath = path.join(__dirname, '../database/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSQL);
    console.log('✅ Database schema created successfully\n');

    // Read and execute seed data
    console.log('🌱 Seeding database with initial data...');
    const seedPath = path.join(__dirname, '../database/seeds/001_initial_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSQL);
    console.log('✅ Initial data seeded successfully\n');

    // Verify setup
    console.log('🔍 Verifying database setup...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const itemCount = await pool.query('SELECT COUNT(*) FROM items');
    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');

    console.log('\n📊 Sample data counts:');
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Items: ${itemCount.rows[0].count}`);
    console.log(`   - Projects: ${projectCount.rows[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend server: cd ../frontend && npm run dev');
    console.log('   3. Visit http://localhost:5173 to access the application');
    console.log('\n🔑 Default login credentials:');
    console.log('   Email: admin@mvdassist.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
