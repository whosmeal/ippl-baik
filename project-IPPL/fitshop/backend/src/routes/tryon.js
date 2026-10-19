const express = require('express');
const router = express.Router();
const tryOnController = require('../controllers/tryOnController');
const auth = require('../middleware/authMiddleware');

router.post('/body-data', auth, tryOnController.saveBodyData);
router.get('/body-data', auth, tryOnController.getMyBodyData);
router.post('/session', auth, tryOnController.createTryOnSession);

module.exports = router;
