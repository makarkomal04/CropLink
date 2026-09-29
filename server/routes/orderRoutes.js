const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getMyOrders,
    getOrders,
    getStats,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, authorize('admin', 'farmer'), getOrders); // Admin sees all. Farmer might need filter later.

router.route('/myorders').get(protect, getMyOrders);
router.route('/stats').get(protect, authorize('admin'), getStats);
router.route('/:id/status').put(protect, authorize('admin', 'farmer'), updateOrderStatus);

module.exports = router;
