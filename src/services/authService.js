const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 */
const register = async ({ name, email, password, balance, timezone }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({ name, email, password_hash, balance: balance || 0, timezone });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { user, token };
};

/**
 * Login an existing user.
 */
const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const { password_hash, ...safeUser } = user;
  const token = jwt.sign({ id: safeUser.id, email: safeUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { user: safeUser, token };
};

/**
 * Get the current authenticated user's profile.
 */
const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getProfile };
