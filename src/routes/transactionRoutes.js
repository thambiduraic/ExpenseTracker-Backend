const { Router } = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', transactionController.list);
router.post('/', transactionController.create);
router.get('/:id', transactionController.getOne);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

module.exports = router;
