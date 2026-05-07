const notificationRepo = require('../repositories/notificationRepository');

const list = async (req, res, next) => {
  try {
    const notifications = await notificationRepo.findUnread(req.user.id);
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    await notificationRepo.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, markRead };
