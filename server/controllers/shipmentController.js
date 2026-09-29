const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all accepted (Quality Passed) orders for shipment
// @route   GET /api/shipment/orders
// @access  Private/ShipmentManager/Admin
const getAcceptedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ warehouseStatus: 'Quality Passed' })
            .populate('customer', 'name email')
            .populate('assignedDeliveryBoy', 'name email')
            .populate('orderItems.product', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all delivery boys
// @route   GET /api/shipment/delivery-boys
// @access  Private/ShipmentManager/Admin
const getDeliveryBoys = async (req, res) => {
    try {
        const deliveryBoys = await User.find({ role: 'delivery_boy' }).select('name email');
        res.json(deliveryBoys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign a delivery boy to an order
// @route   PUT /api/shipment/orders/:id/assign
// @access  Private/ShipmentManager/Admin
const assignDeliveryBoy = async (req, res) => {
    try {
        const { deliveryBoyId } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const deliveryBoy = await User.findById(deliveryBoyId);
        if (!deliveryBoy || deliveryBoy.role !== 'delivery_boy') {
            return res.status(400).json({ message: 'Invalid delivery boy' });
        }

        order.assignedDeliveryBoy = deliveryBoyId;
        await order.save();

        const updated = await Order.findById(order._id)
            .populate('customer', 'name email')
            .populate('assignedDeliveryBoy', 'name email');

        res.json({ message: 'Delivery boy assigned', order: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark order as Shipped
// @route   PUT /api/shipment/orders/:id/ship
// @access  Private/ShipmentManager/Admin
const markShipped = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.assignedDeliveryBoy) {
            return res.status(400).json({ message: 'Please assign a delivery boy before shipping' });
        }

        order.status = 'Shipped';
        order.warehouseStatus = 'Shipped';
        order.shippedAt = Date.now();
        await order.save();

        res.json({ message: 'Order marked as Shipped', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAcceptedOrders,
    getDeliveryBoys,
    assignDeliveryBoy,
    markShipped
};
