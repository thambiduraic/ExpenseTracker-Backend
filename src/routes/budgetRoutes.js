const { Router } = require('express');
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', budgetController.list);
router.post('/', budgetController.upsert);
router.delete('/:id', budgetController.remove);

module.exports = router;
