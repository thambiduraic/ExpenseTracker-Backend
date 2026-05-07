const { query } = require('../config/db');

/**
 * Upsert a budget entry for a given user, month, and category.
 * month format: 'YYYY-MM-01'
 */
const upsert = async ({ user_id, category, amount, month }) => {
  const result = await query(
    `INSERT INTO budgets (user_id, category, amount, month)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, category, month)
     DO UPDATE SET amount = EXCLUDED.amount
     RETURNING *`,
    [user_id, category, amount, month]
  );
  return result.rows[0];
};

/**
 * Get all budgets for a user for a given month.
 */
const findByUserAndMonth = async (userId, month) => {
  const result = await query(
    `SELECT * FROM budgets WHERE user_id = $1 AND month = $2`,
    [userId, month]
  );
  return result.rows;
};

/**
 * Delete a budget entry.
 */
const remove = async (id, userId) => {
  const result = await query(
    `DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
};

module.exports = { upsert, findByUserAndMonth, remove };
