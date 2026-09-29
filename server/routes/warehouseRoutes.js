const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getPendingOrders,
    acceptOrder,
    rejectOrder,
    markForShipping,
    confirmDelivery,
    getWarehouseStats
} = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const warehouseRoles = ['admin', 'warehouse'];

// Unified panel endpoint
router.get('/orders/all', protect, authorize(...warehouseRoles), getAllOrders);

// Filtered endpoint (legacy)
router.get('/orders/pending', protect, authorize(...warehouseRoles), getPendingOrders);
router.put('/orders/:id/accept', protect, authorize(...warehouseRoles), acceptOrder);
router.put('/orders/:id/reject', protect, authorize(...warehouseRoles), rejectOrder);
router.put('/orders/:id/ship', protect, authorize(...warehouseRoles), markForShipping);
router.put('/orders/:id/deliver', protect, authorize(...warehouseRoles), confirmDelivery);
router.get('/stats', protect, authorize(...warehouseRoles), getWarehouseStats);

module.exports = router;
