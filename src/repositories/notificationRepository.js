const { query } = require('../config/db');

/**
 * Create an in-app notification for a user.
 */
const create = async ({ user_id, message, type = 'reminder' }) => {
  const result = await query(
    `INSERT INTO notifications (user_id, message, type)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, message, type]
  );
  return result.rows[0];
};

/**
 * Get all unread notifications for a user.
 */
const findUnread = async (userId) => {
  const result = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1 AND is_read = false
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Mark all notifications as read for a user.
 */
const markAllRead = async (userId) => {
  await query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Delete a notification.
 */
const remove = async (id, userId) => {
  await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
};

module.exports = { create, findUnread, markAllRead, remove };
