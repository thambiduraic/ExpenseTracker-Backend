/**
 * Database Migration Script
 * Run once: node src/utils/db-migrate.js
 * Creates all tables required for the Financial Assistant app.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { query, pool } = require('../config/db');

const migrate = async () => {
  console.log('🚀 Running database migration...');

  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        balance       NUMERIC(12, 2) NOT NULL DEFAULT 0,
        timezone      VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
        last_logged_date DATE,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ users table ready');

    // Transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
        amount     NUMERIC(12, 2) NOT NULL,
        category   VARCHAR(100) NOT NULL,
        note       TEXT,
        date       DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
    `);
    console.log('✅ transactions table ready');

    // Budgets table
    await query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category   VARCHAR(100) NOT NULL,
        amount     NUMERIC(12, 2) NOT NULL,
        month      DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, category, month)
      );
    `);
    console.log('✅ budgets table ready');

    // Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message    TEXT NOT NULL,
        type       VARCHAR(50) NOT NULL DEFAULT 'reminder',
        is_read    BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
    `);
    console.log('✅ notifications table ready');

    console.log('\n🎉 Migration complete! All tables are ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

migrate();
