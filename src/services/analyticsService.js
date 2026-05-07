const transactionRepo = require('../repositories/transactionRepository');
const budgetRepo = require('../repositories/budgetRepository');
const userRepo = require('../repositories/userRepository');

const MIN_DAYS_FOR_PREDICTION = 7;

/**
 * Check if user has enough data (at least 7 active days in the last 30).
 */
const checkDataSufficiency = async (userId) => {
  const activeDays = await transactionRepo.countActiveDays(userId, 30);
  return activeDays >= MIN_DAYS_FOR_PREDICTION;
};

/**
 * Calculate the financial runway:
 * Average daily spend (last 30 days) → days of money remaining.
 */
const getRunway = async (userId) => {
  const hasSufficientData = await checkDataSufficiency(userId);
  if (!hasSufficientData) {
    return {
      hasSufficientData: false,
      message: 'Not enough data to predict accurately. Log expenses for at least 7 days.',
    };
  }

  const user = await userRepo.findById(userId);
  const dailySpend = await transactionRepo.getDailySpend(userId, 30);

  const totalSpend30Days = dailySpend.reduce((sum, row) => sum + parseFloat(row.total), 0);
  const avgDailySpend = totalSpend30Days / 30;

  const balance = parseFloat(user.balance || 0);
  const daysOfMoneyLeft = avgDailySpend > 0 ? Math.floor(balance / avgDailySpend) : 9999;

  // Days remaining in current month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeftInMonth = Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24));

  const isAtRisk = daysOfMoneyLeft < daysLeftInMonth;

  return {
    hasSufficientData: true,
    balance,
    avgDailySpend: parseFloat(avgDailySpend.toFixed(2)),
    daysOfMoneyLeft,
    daysLeftInMonth,
    isAtRisk,
  };
};

/**
 * Compare MTD spend vs budget per category. 
 * If no budget set for a category, falls back to historical comparison.
 */
const getOverspending = async (userId) => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const [mtdSpend, budgets] = await Promise.all([
    transactionRepo.getMTDSpendByCategory(userId),
    budgetRepo.findByUserAndMonth(userId, month),
  ]);

  const budgetMap = {};
  budgets.forEach((b) => {
    budgetMap[b.category] = parseFloat(b.amount);
  });

  const results = mtdSpend.map((row) => {
    const spent = parseFloat(row.total);
    const budget = budgetMap[row.category];
    const hasBudget = budget !== undefined;
    const percentUsed = hasBudget ? (spent / budget) * 100 : null;
    const isOverBudget = hasBudget && spent > budget;
    const isNearLimit = hasBudget && percentUsed >= 80 && !isOverBudget;

    return {
      category: row.category,
      spent,
      budget: budget || null,
      hasBudget,
      percentUsed: percentUsed ? parseFloat(percentUsed.toFixed(1)) : null,
      isOverBudget,
      isNearLimit,
    };
  });

  return results;
};

module.exports = { getRunway, getOverspending, checkDataSufficiency };
