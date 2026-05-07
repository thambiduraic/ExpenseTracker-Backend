const budgetRepo = require('../repositories/budgetRepository');

const upsert = async (req, res, next) => {
  try {
    const { category, amount, month } = req.body;
    if (!category || !amount || !month) {
      return res.status(400).json({ success: false, message: 'category, amount, and month are required.' });
    }
    const budget = await budgetRepo.upsert({ user_id: req.user.id, category, amount: parseFloat(amount), month });
    res.status(201).json({ success: true, data: { budget } });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const budgets = await budgetRepo.findByUserAndMonth(req.user.id, month);
    res.json({ success: true, data: { budgets } });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await budgetRepo.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Budget not found.' });
    res.json({ success: true, message: 'Budget deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { upsert, list, remove };
