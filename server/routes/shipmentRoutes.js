const express = require('express');
const router = express.Router();
const {
    getAcceptedOrders,
    getDeliveryBoys,
    assignDeliveryBoy,
    markShipped
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/orders', protect, authorize('admin', 'shipment_manager'), getAcceptedOrders);
router.get('/delivery-boys', protect, authorize('admin', 'shipment_manager'), getDeliveryBoys);
router.put('/orders/:id/assign', protect, authorize('admin', 'shipment_manager'), assignDeliveryBoy);
router.put('/orders/:id/ship', protect, authorize('admin', 'shipment_manager'), markShipped);

module.exports = router;
