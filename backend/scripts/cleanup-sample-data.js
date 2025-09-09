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

async function cleanupSampleData() {
  try {
    console.log('🧹 Cleaning up sample data...\n');

    // First, let's see what we have
    const itemCount = await pool.query('SELECT COUNT(*) FROM items');
    console.log(`📊 Current items: ${itemCount.rows[0].count}`);

    // Define sample item names to remove
    const sampleItemNames = [
      'Sony FX9 Camera',
      'Canon C70 Camera', 
      'Blackmagic Pocket 6K',
      'Canon 24-70mm f/2.8L',
      'Canon 70-200mm f/2.8L',
      'Sony 85mm f/1.4 GM',
      'Aputure 300D II',
      'Aputure 600D Pro',
      'Kino Flo Diva-Lite 400',
      'Sennheiser MKE 600',
      'Zoom H6 Recorder',
      'Rode Wireless GO II',
      'Atomos Ninja V',
      'SmallHD Focus 7',
      'Samsung T7 2TB',
      'SanDisk Extreme Pro 128GB'
    ];

    // Remove sample item history first (to avoid foreign key constraints)
    const historyResult = await pool.query('DELETE FROM item_history WHERE id IN (SELECT id FROM item_history LIMIT 10)');
    if (historyResult.rowCount > 0) {
      console.log(`🗑️  Removed ${historyResult.rowCount} sample history records`);
    }

    // Remove sample bookings
    const result = await pool.query('DELETE FROM bookings WHERE id IN (SELECT id FROM bookings LIMIT 10)');
    if (result.rowCount > 0) {
      console.log(`🗑️  Removed ${result.rowCount} sample bookings`);
    }

    // Remove sample items (after removing dependent records)
    for (const itemName of sampleItemNames) {
      const result = await pool.query('DELETE FROM items WHERE name = $1', [itemName]);
      if (result.rowCount > 0) {
        console.log(`🗑️  Removed sample item: ${itemName}`);
      }
    }

    // Remove sample projects first (to avoid foreign key constraints with clients)
    const sampleProjects = [
      'Action Movie Alpha',
      'Documentary Beta', 
      'Commercial Gamma',
      'Indie Film Delta'
    ];

    for (const projectName of sampleProjects) {
      const result = await pool.query('DELETE FROM projects WHERE name = $1', [projectName]);
      if (result.rowCount > 0) {
        console.log(`🗑️  Removed sample project: ${projectName}`);
      }
    }

    // Remove sample clients (after removing dependent projects)
    const sampleClients = [
      'Paramount Pictures',
      'Netflix Originals',
      'Independent Film Co',
      'Commercial Agency'
    ];

    for (const clientName of sampleClients) {
      const result = await pool.query('DELETE FROM clients WHERE name = $1', [clientName]);
      if (result.rowCount > 0) {
        console.log(`🗑️  Removed sample client: ${clientName}`);
      }
    }

    // Get final counts
    const finalItemCount = await pool.query('SELECT COUNT(*) FROM items');
    const finalProjectCount = await pool.query('SELECT COUNT(*) FROM projects');
    const finalClientCount = await pool.query('SELECT COUNT(*) FROM clients');
    const finalBookingCount = await pool.query('SELECT COUNT(*) FROM bookings');

    console.log('\n✅ Cleanup completed!');
    console.log('📊 Final counts:');
    console.log(`   - Items: ${finalItemCount.rows[0].count}`);
    console.log(`   - Projects: ${finalProjectCount.rows[0].count}`);
    console.log(`   - Clients: ${finalClientCount.rows[0].count}`);
    console.log(`   - Bookings: ${finalBookingCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanupSampleData();
