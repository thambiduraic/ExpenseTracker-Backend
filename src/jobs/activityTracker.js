const cron = require('node-cron');
const userRepo = require('../repositories/userRepository');
const notificationRepo = require('../repositories/notificationRepository');

/**
 * Daily Activity Tracker Job
 * Runs every day at 9:00 PM IST (15:30 UTC).
 * Checks if users haven't logged any expense in 2+ days
 * and creates an in-app reminder notification.
 */
const startActivityTracker = () => {
  // Cron: "30 15 * * *" = 15:30 UTC = 9:00 PM IST daily
  cron.schedule('30 15 * * *', async () => {
    console.log('[ActivityTracker] Running daily check...');
    try {
      const inactiveUsers = await userRepo.findInactiveUsers();
      console.log(`[ActivityTracker] Found ${inactiveUsers.length} inactive user(s).`);

      for (const user of inactiveUsers) {
        await notificationRepo.create({
          user_id: user.id,
          message: "You haven't added expenses in a while. Adding them now helps keep your predictions accurate.",
          type: 'reminder',
        });
      }

      console.log('[ActivityTracker] Notifications created successfully.');
    } catch (err) {
      console.error('[ActivityTracker] Error:', err.message);
    }
  });

  console.log('[ActivityTracker] Cron job scheduled (daily at 9:00 PM IST).');
};

module.exports = { startActivityTracker };
