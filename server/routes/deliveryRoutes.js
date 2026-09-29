const express = require('express');
const router = express.Router();
const {
    getMyDeliveries,
    getMyCompletedDeliveries,
    markDelivered
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-orders', protect, authorize('delivery_boy', 'admin'), getMyDeliveries);
router.get('/my-completed', protect, authorize('delivery_boy', 'admin'), getMyCompletedDeliveries);
router.put('/orders/:id/deliver', protect, authorize('delivery_boy', 'admin'), markDelivered);

module.exports = router;
