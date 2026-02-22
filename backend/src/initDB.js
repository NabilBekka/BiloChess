require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const initDB = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'init.sql'), 'utf-8');
    console.log('♟️  Initialisation de la base de données Bilo Chess...\n');
    await pool.query(sql);
    console.log('✅ Tables créées avec succès !');
    console.log('   - users');
    console.log('   - email_verification_codes');
    console.log('   - password_reset_codes');
    console.log('\n🎉 Base de données prête !\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    process.exit(1);
  }
};

initDB();
