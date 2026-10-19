const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, role('penjual', 'admin'), productController.createProduct);
router.put('/:id', auth, role('penjual', 'admin'), productController.updateProduct);
router.delete('/:id', auth, role('penjual', 'admin'), productController.deleteProduct);

module.exports = router;
