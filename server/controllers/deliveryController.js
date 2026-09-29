const Order = require('../models/Order');

// @desc    Get all orders assigned to this delivery boy with status Shipped
// @route   GET /api/delivery/my-orders
// @access  Private/DeliveryBoy
const getMyDeliveries = async (req, res) => {
    try {
        const orders = await Order.find({
            assignedDeliveryBoy: req.user._id,
            status: 'Shipped'
        })
        .populate('customer', 'name email')
        .populate('assignedDeliveryBoy', 'name email')
        .populate('orderItems.product', 'name')
        .sort({ shippedAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all delivered orders assigned to this delivery boy
// @route   GET /api/delivery/my-completed
// @access  Private/DeliveryBoy
const getMyCompletedDeliveries = async (req, res) => {
    try {
        const orders = await Order.find({
            assignedDeliveryBoy: req.user._id,
            status: 'Delivered'
        })
        .populate('customer', 'name email')
        .populate('assignedDeliveryBoy', 'name email')
        .populate('orderItems.product', 'name')
        .sort({ deliveredAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark an order as Delivered
// @route   PUT /api/delivery/orders/:id/deliver
// @access  Private/DeliveryBoy
const markDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure only the assigned delivery boy can mark it delivered
        if (
            req.user.role === 'delivery_boy' &&
            order.assignedDeliveryBoy?.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.status = 'Delivered';
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await order.save();

        res.json({ message: 'Order marked as Delivered', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyDeliveries,
    getMyCompletedDeliveries,
    markDelivered
};
