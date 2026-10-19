const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth, role('admin'));

router.get('/overview', adminController.getOverview);
router.get('/stores', adminController.getAllStores);
router.put('/stores/:id/verify', adminController.verifyStore);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
