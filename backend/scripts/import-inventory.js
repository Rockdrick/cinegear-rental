#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mvdassist_equipos',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Category mapping from Spanish to English
const categoryMapping = {
  'Almacenamiento': 'Storage',
  'Computador': 'Computers',
  'Monitores': 'Monitors',
  'Energia': 'Power',
  'Cables': 'Cables',
  'Interfaz': 'Interfaces (keyboard, mouse, color Tangen Ripple)',
  'Hub': 'Hubs',
  'Conversores y splitters': 'Converters and Splitters',
  'Interfaces AV': 'AV Interfaces',
  'Adaptadores': 'Adapters',
  'Carro y accès': 'Carts and accesories',
  'Streaming': 'Streaming',
  'Racks y maletas': 'Racks and Cases',
  'Inhalambrico': 'Wireless',
  'Control Iris': 'Iris Controls',
  'Antena': 'Antennas'
};

// Condition mapping (we'll create 5 levels as you mentioned)
const conditionMapping = {
  'EXCELENTE': 'Excellent',
  'BUENO': 'Good', 
  'REGULAR': 'Fair',
  'MALO': 'Needs Repair',
  'ROTO': 'Out of Service'
};

// State mapping
const stateMapping = {
  'EN USO': 'In Use',
  'LIBRE': 'Available',
  'OFICINA': 'Office',
  'Mueble': 'Furniture',
  'VACÍO': 'Empty'
};

async function importInventory() {
  try {
    console.log('🚀 Starting inventory import...\n');

    // First, let's create the missing categories
    console.log('📋 Creating categories...');
    for (const [spanish, english] of Object.entries(categoryMapping)) {
      await pool.query(`
        INSERT INTO categories (name, description) 
        VALUES ($1, $2) 
        ON CONFLICT (name) DO NOTHING
      `, [english, `Imported from Spanish: ${spanish}`]);
    }

    // Create conditions
    console.log('📋 Creating conditions...');
    for (const [spanish, english] of Object.entries(conditionMapping)) {
      await pool.query(`
        INSERT INTO conditions (name, description) 
        VALUES ($1, $2) 
        ON CONFLICT (name) DO NOTHING
      `, [english, `Imported from Spanish: ${spanish}`]);
    }

    // Create item locations
    console.log('📋 Creating item locations...');
    const locations = ['Montevideo', 'OFICINA', 'PUBLI', 'BS AS (LEAN)', 'TV_1', 'TV_2', 'EVDF', 'UB', 'UA'];
    for (const location of locations) {
      await pool.query(`
        INSERT INTO item_locations (name, description) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING
      `, [location, `Imported location: ${location}`]);
    }

    // Create users for responsible people
    console.log('📋 Creating users for responsible people...');
    const responsiblePeople = ['Juan Samyn', 'Diego', 'Facundo'];
    for (const person of responsiblePeople) {
      const email = `${person.toLowerCase().replace(' ', '.')}@mvdassist.com`;
      await pool.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role_id, phone_number) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (email) DO NOTHING
      `, [
        person.split(' ')[0], 
        person.split(' ')[1] || '', 
        email, 
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
        3, // Team Member role
        '+598-9999-9999'
      ]);
    }

    // Create default client first
    console.log('📋 Creating default client...');
    await pool.query(`
      INSERT INTO clients (name, contact_person, email, phone_number, address, notes) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (name) DO NOTHING
    `, [
      'MVD Assist Internal',
      'Admin',
      'admin@mvdassist.com',
      '+598-9999-9999',
      'Montevideo, Uruguay',
      'Default client for internal projects'
    ]);

    // Get the default client ID
    const clientResult = await pool.query('SELECT id FROM clients WHERE name = $1', ['MVD Assist Internal']);
    const defaultClientId = clientResult.rows[0].id;

    // Create projects
    console.log('📋 Creating projects...');
    const projects = ['MGTA (S3)', 'MGTA (S02)', 'PUBLI', 'KOTSW', 'EVDF', 'RAID SSD', 'CATE U2', 'CATE_BACKUP_SET_01', 'COPP_BACKUP_SET_02', 'MÁSTER_SET_P&H (2)', 'VT_BACKUP_SET_02'];
    for (const projectName of projects) {
      await pool.query(`
        INSERT INTO projects (name, client_id, project_manager_user_id, description, start_date, end_date, status, location) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        ON CONFLICT DO NOTHING
      `, [
        projectName,
        defaultClientId, // Use the actual client ID
        2, // Default project manager
        `Imported project: ${projectName}`,
        '2024-01-01',
        '2024-12-31',
        'Active',
        'Montevideo'
      ]);
    }

    // Now import the items
    console.log('📦 Importing items...');
    const items = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../../INVENTARIO MVD_ASSIST.xlsx - Ingles.csv'))
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty rows
          if (!row['Brand'] && !row['MODEL C109'] && !row['Category']) return;
          
          const brand = row['Brand'] || '';
          const model = row['MODEL C109'] || '';
          const category = row['Category'] || '';
          const type = row['Type'] || '';
          const capacity = row['Capacity'] || '';
          const serialNumber = row['Serial Number'] || '';
          const value = parseFloat(row['Value in $']) || 0;
          const condition = row['Condition'] || 'Good';
          const state = row['State'] || 'Available';
          const project = row['Project'] || '';
          const projectStart = row['Project start'] || '';
          const projectEnd = row['Project end'] || '';
          const location = row['Location'] || '';
          const responsible = row['Responsible'] || '';
          const observation = row['Observation'] || '';
          const labelName = row['Label/Name'] || '';
          const notes1 = row['Notes 1'] || '';
          const notes2 = row['Notes 2'] || '';

          // Create item name
          let itemName = labelName || `${brand} ${model}`.trim();
          if (!itemName) itemName = `${type} ${capacity}`.trim();
          if (!itemName) itemName = 'Unnamed Item';

          // Combine all notes
          const allNotes = [observation, notes1, notes2].filter(n => n).join(' | ');

          items.push({
            name: itemName,
            make: brand,
            model: model,
            serialNumber: serialNumber,
            category: categoryMapping[category] || category,
            type: type,
            capacity: capacity,
            value: value,
            condition: condition,
            state: state,
            project: project,
            projectStart: projectStart,
            projectEnd: projectEnd,
            location: location,
            responsible: responsible,
            notes: allNotes
          });
        })
        .on('end', async () => {
          try {
            console.log(`📊 Found ${items.length} items to import`);

            // Get category IDs
            const categoryIds = {};
            const categoryResult = await pool.query('SELECT id, name FROM categories');
            categoryResult.rows.forEach(cat => {
              categoryIds[cat.name] = cat.id;
            });

            // Get condition IDs
            const conditionIds = {};
            const conditionResult = await pool.query('SELECT id, name FROM conditions');
            conditionResult.rows.forEach(cond => {
              conditionIds[cond.name] = cond.id;
            });

            // Get location IDs
            const locationIds = {};
            const locationResult = await pool.query('SELECT id, name FROM item_locations');
            locationResult.rows.forEach(loc => {
              locationIds[loc.name] = loc.id;
            });

            // Get user IDs
            const userIds = {};
            const userResult = await pool.query('SELECT id, first_name, last_name FROM users');
            userResult.rows.forEach(user => {
              const fullName = `${user.first_name} ${user.last_name}`.trim();
              userIds[fullName] = user.id;
            });

            // Get project IDs
            const projectIds = {};
            const projectResult = await pool.query('SELECT id, name FROM projects');
            projectResult.rows.forEach(proj => {
              projectIds[proj.name] = proj.id;
            });

            // Insert items
            let importedCount = 0;
            for (const item of items) {
              try {
                const categoryId = categoryIds[item.category] || categoryIds['Storage'];
                const conditionId = conditionIds[item.condition] || conditionIds['Good'];
                const locationId = item.location ? locationIds[item.location] : null;
                const responsibleUserId = item.responsible ? userIds[item.responsible] : null;
                const projectId = item.project ? projectIds[item.project] : null;

                await pool.query(`
                  INSERT INTO items (
                    name, make, model, serial_number, category_id, current_condition_id,
                    item_location_id, notes, acquisition_date, purchase_price, is_rentable, is_active
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [
                  item.name,
                  item.make,
                  item.model,
                  item.serialNumber || null,
                  categoryId,
                  conditionId,
                  locationId,
                  item.notes || null,
                  '2024-01-01', // Default acquisition date
                  item.value,
                  true, // is_rentable
                  item.state !== 'VACÍO' // is_active
                ]);

                importedCount++;
                if (importedCount % 50 === 0) {
                  console.log(`📦 Imported ${importedCount} items...`);
                }
              } catch (itemError) {
                console.error(`❌ Error importing item ${item.name}:`, itemError.message);
              }
            }

            console.log(`\n✅ Successfully imported ${importedCount} items!`);
            console.log('\n📊 Import Summary:');
            console.log(`   - Categories: ${Object.keys(categoryIds).length}`);
            console.log(`   - Conditions: ${Object.keys(conditionIds).length}`);
            console.log(`   - Locations: ${Object.keys(locationIds).length}`);
            console.log(`   - Users: ${Object.keys(userIds).length}`);
            console.log(`   - Projects: ${Object.keys(projectIds).length}`);
            console.log(`   - Items: ${importedCount}`);

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Install csv-parser if not already installed
const { execSync } = require('child_process');
try {
  require('csv-parser');
} catch (e) {
  console.log('📦 Installing csv-parser...');
  execSync('npm install csv-parser', { cwd: __dirname });
}

importInventory().finally(() => {
  pool.end();
});
