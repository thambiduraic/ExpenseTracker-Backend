/**
 * Rules Engine — maps analytics data to specific, actionable advice strings.
 * Never produces generic responses. Always data-driven.
 */

const INR = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

/**
 * Generate smart alerts from runway and overspending data.
 * @param {Object} runway - result from analyticsService.getRunway
 * @param {Array}  overspending - result from analyticsService.getOverspending
 * @returns {Array<{ type: string, severity: string, message: string, action: string }>}
 */
const generateAlerts = (runway, overspending) => {
  const alerts = [];

  // ── Runway Alerts ─────────────────────────────────────────────
  if (runway.hasSufficientData) {
    if (runway.isAtRisk) {
      alerts.push({
        type: 'runway',
        severity: 'critical',
        message: `At your current rate (${INR(runway.avgDailySpend)}/day), your balance of ${INR(runway.balance)} will last only ${runway.daysOfMoneyLeft} day${runway.daysOfMoneyLeft !== 1 ? 's' : ''} — but ${runway.daysLeftInMonth} days remain this month.`,
        action: `Cut daily spend to ${INR(runway.balance / runway.daysLeftInMonth)} to make it through the month.`,
      });
    } else if (runway.daysOfMoneyLeft < runway.daysLeftInMonth + 5) {
      alerts.push({
        type: 'runway',
        severity: 'warning',
        message: `You have ${runway.daysOfMoneyLeft} days of money left. Month ends in ${runway.daysLeftInMonth} days — cutting it close.`,
        action: `Reduce daily spend by ${INR(runway.avgDailySpend * 0.15)} to build a small buffer.`,
      });
    }
  }

  // ── Overspending Alerts ────────────────────────────────────────
  overspending.forEach((cat) => {
    if (cat.isOverBudget) {
      const overshoot = cat.spent - cat.budget;
      alerts.push({
        type: 'budget',
        severity: 'critical',
        message: `You've gone ${INR(overshoot)} over your ${cat.category} budget (${INR(cat.spent)} spent of ${INR(cat.budget)} limit).`,
        action: `Stop all ${cat.category} spending for the rest of the month to limit further damage.`,
      });
    } else if (cat.isNearLimit) {
      const remaining = cat.budget - cat.spent;
      alerts.push({
        type: 'budget',
        severity: 'warning',
        message: `${cat.category} is at ${cat.percentUsed}% of budget — only ${INR(remaining)} left.`,
        action: `Reduce ${cat.category} spending by ${INR((cat.spent / new Date().getDate()) * 0.3)}/day to stay under budget.`,
      });
    }
  });

  return alerts;
};

module.exports = { generateAlerts };
