const analyticsService = require('../services/analyticsService');
const rulesEngine = require('../services/rulesEngine');

const getInsights = async (req, res, next) => {
  try {
    const [runway, overspending] = await Promise.all([
      analyticsService.getRunway(req.user.id),
      analyticsService.getOverspending(req.user.id),
    ]);

    // Only run rules engine if we have data
    const alerts = runway.hasSufficientData
      ? rulesEngine.generateAlerts(runway, overspending)
      : [];

    res.json({
      success: true,
      data: { runway, overspending, alerts },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInsights };
