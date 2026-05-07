const { query } = require('../config/db');

/**
 * Find a user by their email address.
 */
const findByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

/**
 * Find a user by their ID.
 */
const findById = async (id) => {
  const result = await query('SELECT id, name, email, balance, timezone, last_logged_date, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

/**
 * Create a new user.
 */
const create = async ({ name, email, password_hash, balance = 0, timezone = 'Asia/Kolkata' }) => {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, balance, timezone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, balance, timezone, created_at`,
    [name, email, password_hash, balance, timezone]
  );
  return result.rows[0];
};

/**
 * Update the user's last logged date to today.
 */
const updateLastLoggedDate = async (userId) => {
  await query(
    `UPDATE users SET last_logged_date = CURRENT_DATE WHERE id = $1`,
    [userId]
  );
};

/**
 * Update user balance.
 */
const updateBalance = async (userId, balance) => {
  const result = await query(
    `UPDATE users SET balance = $1 WHERE id = $2 RETURNING id, balance`,
    [balance, userId]
  );
  return result.rows[0];
};

/**
 * Get all users with last_logged_date more than 2 days ago (for cron job).
 */
const findInactiveUsers = async () => {
  const result = await query(
    `SELECT id, name, email, last_logged_date
     FROM users
     WHERE last_logged_date < CURRENT_DATE - INTERVAL '2 days'
        OR last_logged_date IS NULL`
  );
  return result.rows;
};

module.exports = { findByEmail, findById, create, updateLastLoggedDate, updateBalance, findInactiveUsers };
