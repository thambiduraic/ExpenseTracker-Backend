const { Router } = require('express');
const insightsController = require('../controllers/insightsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);
router.get('/', insightsController.getInsights);

module.exports = router;
