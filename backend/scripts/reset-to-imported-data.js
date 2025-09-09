#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mvdassist_equipos',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetToImportedData() {
  try {
    console.log('🔄 Resetting to imported data only...\n');

    // Clear all data in the correct order to avoid foreign key constraints
    console.log('🗑️  Clearing all data...');
    
    // Clear dependent tables first
    await pool.query('DELETE FROM item_history');
    console.log('✅ Cleared item_history');
    
    await pool.query('DELETE FROM bookings');
    console.log('✅ Cleared bookings');
    
    await pool.query('DELETE FROM package_items');
    console.log('✅ Cleared package_items');
    
    await pool.query('DELETE FROM gear_packages');
    console.log('✅ Cleared gear_packages');
    
    await pool.query('DELETE FROM user_availability');
    console.log('✅ Cleared user_availability');
    
    // Clear main tables
    await pool.query('DELETE FROM items');
    console.log('✅ Cleared items');
    
    await pool.query('DELETE FROM projects');
    console.log('✅ Cleared projects');
    
    await pool.query('DELETE FROM clients');
    console.log('✅ Cleared clients');
    
    // Keep users, categories, conditions, locations, roles as they have the imported data
    
    // Get final counts
    const itemCount = await pool.query('SELECT COUNT(*) FROM items');
    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
    const clientCount = await pool.query('SELECT COUNT(*) FROM clients');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    const conditionCount = await pool.query('SELECT COUNT(*) FROM conditions');
    const locationCount = await pool.query('SELECT COUNT(*) FROM item_locations');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');

    console.log('\n✅ Reset completed!');
    console.log('📊 Current counts:');
    console.log(`   - Items: ${itemCount.rows[0].count}`);
    console.log(`   - Projects: ${projectCount.rows[0].count}`);
    console.log(`   - Clients: ${clientCount.rows[0].count}`);
    console.log(`   - Categories: ${categoryCount.rows[0].count}`);
    console.log(`   - Conditions: ${conditionCount.rows[0].count}`);
    console.log(`   - Locations: ${locationCount.rows[0].count}`);
    console.log(`   - Users: ${userCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetToImportedData();
