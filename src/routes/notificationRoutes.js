const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);
router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markRead);

module.exports = router;
