const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

// Simple UUID v4 generator
function generateUUID() {
  return crypto.randomUUID();
}

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mvdassist_equipos',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Category mapping from Spanish to English
const categoryMapping = {
  'Energia': 'Power',
  'Conversores y splitters': 'Converters & Splitters',
  'Computador': 'Computer',
  'Hub': 'Hub',
  'Monitores': 'Monitors',
  'Interfaces AV': 'AV Interfaces',
  'Camara': 'Camera',
  'Lentes': 'Lenses',
  'Audio': 'Audio',
  'Iluminacion': 'Lighting',
  'Grip': 'Grip',
  'Transporte': 'Transport',
  'Accesorios': 'Accessories',
  'DIT': 'DIT Equipment',
  'Almacenamiento': 'Storage'
};

// Condition mapping
const conditionMapping = {
  'Excelente': 'Excellent',
  'Bueno': 'Good',
  'Regular': 'Fair',
  'Malo': 'Poor',
  'Nuevo': 'New',
  'Usado': 'Used'
};

// Location mapping
const locationMapping = {
  'OFICINA': 'Office',
  'BS AS (LEAN)': 'Buenos Aires (Lean)',
  'LAB': 'Lab',
  'MAC': 'Mac Station',
  'MAC LAB': 'Mac Lab'
};

async function cleanAndImportInventory() {
  try {
    console.log('Starting inventory import...');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '../../source data/INVENTARIO MVD_ASSIST.xlsx - Ingles.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`Found ${dataLines.length} items to process`);
    
    // First, let's clear existing items (except the seed data)
    console.log('Clearing existing items...');
    await pool.query('DELETE FROM items WHERE id > 20'); // Keep seed data items
    
    // Process each line
    let importedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;
      
      try {
        // Split by semicolon and clean up
        const fields = line.split(';').map(field => field.trim().replace(/"/g, ''));
        
        if (fields.length < 18) {
          console.log(`Skipping line ${i + 2}: insufficient fields (${fields.length})`);
          skippedCount++;
          continue;
        }
        
        const [
          brand,
          model,
          category,
          type,
          capacity,
          serialNumber,
          value,
          condition,
          state,
          project,
          projectStart,
          projectEnd,
          location,
          responsible,
          observation,
          labelName,
          notes1,
          notes2
        ] = fields;
        
        // Skip empty rows
        if (!brand && !model && !category) {
          skippedCount++;
          continue;
        }
        
        // Generate UUID for the item
        const itemUuid = generateUUID();
        
        // Clean and map data
        const cleanBrand = brand && brand !== '-' ? brand : null;
        const cleanModel = model && model !== '-' ? model : null;
        const cleanCategory = categoryMapping[category] || category || 'Accessories';
        const cleanSerial = serialNumber && serialNumber !== '-' ? serialNumber : null;
        const cleanCondition = conditionMapping[condition] || condition || 'Good';
        const cleanLocation = locationMapping[location] || location || 'Main Gear Cage';
        const cleanValue = value ? parseFloat(value.replace(/[^0-9.]/g, '')) : null;
        
        // Combine notes
        const combinedNotes = [observation, notes1, notes2]
          .filter(note => note && note.trim())
          .join(' | ');
        
        // Get or create category
        let categoryId;
        const categoryResult = await pool.query(
          'SELECT id FROM categories WHERE name = $1',
          [cleanCategory]
        );
        
        if (categoryResult.rows.length > 0) {
          categoryId = categoryResult.rows[0].id;
        } else {
          const newCategoryResult = await pool.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
            [cleanCategory, `Imported category: ${cleanCategory}`]
          );
          categoryId = newCategoryResult.rows[0].id;
        }
        
        // Get or create condition
        let conditionId;
        const conditionResult = await pool.query(
          'SELECT id FROM conditions WHERE name = $1',
          [cleanCondition]
        );
        
        if (conditionResult.rows.length > 0) {
          conditionId = conditionResult.rows[0].id;
        } else {
          const newConditionResult = await pool.query(
            'INSERT INTO conditions (name, description) VALUES ($1, $2) RETURNING id',
            [cleanCondition, `Imported condition: ${cleanCondition}`]
          );
          conditionId = newConditionResult.rows[0].id;
        }
        
        // Get or create location
        let locationId;
        const locationResult = await pool.query(
          'SELECT id FROM item_locations WHERE name = $1',
          [cleanLocation]
        );
        
        if (locationResult.rows.length > 0) {
          locationId = locationResult.rows[0].id;
        } else {
          const newLocationResult = await pool.query(
            'INSERT INTO item_locations (name, description) VALUES ($1, $2) RETURNING id',
            [cleanLocation, `Imported location: ${cleanLocation}`]
          );
          locationId = newLocationResult.rows[0].id;
        }
        
        // Create item name from brand and model
        let itemName = '';
        if (cleanBrand && cleanModel) {
          itemName = `${cleanBrand} ${cleanModel}`;
        } else if (cleanBrand) {
          itemName = cleanBrand;
        } else if (cleanModel) {
          itemName = cleanModel;
        } else if (labelName) {
          itemName = labelName;
        } else {
          itemName = `${cleanCategory} Item`;
        }
        
        // Insert the item
        await pool.query(`
          INSERT INTO items (
            uuid, name, make, model, serial_number, category_id, 
            current_condition_id, item_location_id, notes, acquisition_date, 
            purchase_price, is_rentable, is_active, exclusive_usage, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
          )
        `, [
          itemUuid,
          itemName,
          cleanBrand,
          cleanModel,
          cleanSerial,
          categoryId,
          conditionId,
          locationId,
          combinedNotes || null,
          new Date(), // acquisition_date
          cleanValue,
          true, // is_rentable
          true, // is_active
          true  // exclusive_usage
        ]);
        
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`Imported ${importedCount} items...`);
        }
        
      } catch (error) {
        console.error(`Error processing line ${i + 2}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\nImport completed!`);
    console.log(`✅ Imported: ${importedCount} items`);
    console.log(`❌ Skipped: ${skippedCount} items`);
    
    // Show summary
    const totalItems = await pool.query('SELECT COUNT(*) FROM items');
    console.log(`📊 Total items in database: ${totalItems.rows[0].count}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the import
cleanAndImportInventory();
