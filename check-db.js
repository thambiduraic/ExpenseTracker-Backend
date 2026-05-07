const { query, pool } = require('./src/config/db');
require('dotenv').config();

const checkUsers = async () => {
  try {
    const result = await query('SELECT count(*) FROM users');
    console.log('User count:', result.rows[0].count);
  } catch (err) {
    console.error('Error checking users:', err.message);
  } finally {
    await pool.end();
  }
};

checkUsers();
