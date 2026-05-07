const transactionRepo = require('../repositories/transactionRepository');
const userRepo = require('../repositories/userRepository');

const create = async (req, res, next) => {
  try {
    const { type, amount, category, note, date } = req.body;
    if (!type || !amount || !category || !date) {
      return res.status(400).json({ success: false, message: 'type, amount, category, and date are required.' });
    }
    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be "expense" or "income".' });
    }

    const transaction = await transactionRepo.create({
      user_id: req.user.id,
      type,
      amount: parseFloat(amount),
      category,
      note,
      date,
    });

    // Update last logged date
    await userRepo.updateLastLoggedDate(req.user.id);

    res.status(201).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, type } = req.query;
    const transactions = await transactionRepo.findByUser(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
    });
    res.json({ success: true, data: { transactions } });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const transaction = await transactionRepo.findById(req.params.id, req.user.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const transaction = await transactionRepo.update(req.params.id, req.user.id, req.body);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await transactionRepo.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, message: 'Transaction deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
