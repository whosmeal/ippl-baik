const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

router.get('/product/:id', reviewController.getProductReviews);
router.post('/', auth, reviewController.addReview);

module.exports = router;
