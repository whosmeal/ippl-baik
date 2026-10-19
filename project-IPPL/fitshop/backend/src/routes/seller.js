const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/profile', auth, role('penjual', 'admin'), sellerController.getSellerProfile);
router.get('/products', auth, role('penjual', 'admin'), sellerController.getMySellerProducts);

module.exports = router;
