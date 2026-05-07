const { query } = require('../config/db');

/**
 * Create a new transaction (expense or income).
 */
const create = async ({ user_id, type, amount, category, note, date }) => {
  const result = await query(
    `INSERT INTO transactions (user_id, type, amount, category, note, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, type, amount, category, note || null, date]
  );
  return result.rows[0];
};

/**
 * Get paginated transactions for a user.
 */
const findByUser = async (userId, { limit = 20, offset = 0, type } = {}) => {
  let sql = `SELECT * FROM transactions WHERE user_id = $1`;
  const params = [userId];
  if (type) {
    params.push(type);
    sql += ` AND type = $${params.length}`;
  }
  sql += ` ORDER BY date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get a single transaction by id (and user, for security).
 */
const findById = async (id, userId) => {
  const result = await query(
    `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
};

/**
 * Update a transaction.
 */
const update = async (id, userId, { amount, category, note, date, type }) => {
  const result = await query(
    `UPDATE transactions
     SET amount = COALESCE($1, amount),
         category = COALESCE($2, category),
         note = COALESCE($3, note),
         date = COALESCE($4, date),
         type = COALESCE($5, type)
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [amount, category, note, date, type, id, userId]
  );
  return result.rows[0] || null;
};

/**
 * Delete a transaction.
 */
const remove = async (id, userId) => {
  const result = await query(
    `DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
};

/**
 * Get total spend per category for a date range (for analytics).
 */
const getSpendByCategory = async (userId, startDate, endDate) => {
  const result = await query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = $1 AND type = 'expense'
       AND date BETWEEN $2 AND $3
     GROUP BY category`,
    [userId, startDate, endDate]
  );
  return result.rows;
};

/**
 * Get daily spend totals for the last N days (for analytics).
 */
const getDailySpend = async (userId, days = 30) => {
  const result = await query(
    `SELECT date, SUM(amount) AS total
     FROM transactions
     WHERE user_id = $1 AND type = 'expense'
       AND date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
     GROUP BY date
     ORDER BY date ASC`,
    [userId, days]
  );
  return result.rows;
};

/**
 * Count days with at least one logged expense.
 */
const countActiveDays = async (userId, days = 30) => {
  const result = await query(
    `SELECT COUNT(DISTINCT date) AS active_days
     FROM transactions
     WHERE user_id = $1 AND type = 'expense'
       AND date >= CURRENT_DATE - ($2 || ' days')::INTERVAL`,
    [userId, days]
  );
  return parseInt(result.rows[0]?.active_days || 0, 10);
};

/**
 * Get total MTD (month-to-date) spend per category.
 */
const getMTDSpendByCategory = async (userId) => {
  const result = await query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = $1 AND type = 'expense'
       AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
     GROUP BY category`,
    [userId]
  );
  return result.rows;
};

module.exports = { create, findByUser, findById, update, remove, getSpendByCategory, getDailySpend, countActiveDays, getMTDSpendByCategory };
