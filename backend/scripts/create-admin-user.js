const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creating admin user...');
    
    // Hash the password
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // First, ensure the Admin role exists
    const roleQuery = `
      INSERT INTO roles (name, permissions) 
      VALUES ('Admin', '{"all": true}')
      ON CONFLICT (name) DO UPDATE SET 
        permissions = '{"all": true}',
        updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;
    
    const roleResult = await client.query(roleQuery);
    const adminRoleId = roleResult.rows[0].id;
    
    console.log(`✅ Admin role created/updated with ID: ${adminRoleId}`);
    
    // Create the admin user
    const userQuery = `
      INSERT INTO users (first_name, last_name, email, password_hash, role_id, phone_number, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        phone_number = EXCLUDED.phone_number,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, first_name, last_name, email, role_id;
    `;
    
    const userValues = [
      'Admin',
      'User',
      'admin@mvdassist.com',
      hashedPassword,
      adminRoleId,
      '+1-555-0000',
      true
    ];
    
    const userResult = await client.query(userQuery, userValues);
    const adminUser = userResult.rows[0];
    
    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', `${adminUser.first_name} ${adminUser.last_name}`);
    console.log('🆔 User ID:', adminUser.id);
    console.log('🎭 Role ID:', adminUser.role_id);
    
    // Verify the user has the correct role
    const verifyQuery = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1;
    `;
    
    const verifyResult = await client.query(verifyQuery, [adminUser.email]);
    const userWithRole = verifyResult.rows[0];
    
    console.log('\n🔍 User verification:');
    console.log('Role:', userWithRole.role_name);
    console.log('Permissions:', JSON.stringify(userWithRole.permissions, null, 2));
    console.log('Active:', userWithRole.is_active);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n🎉 Admin user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
