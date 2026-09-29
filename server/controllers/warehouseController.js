const Order = require('../models/Order');

// @desc    Get ALL orders for the unified warehouse panel
// @route   GET /api/warehouse/orders/all
// @access  Private/Warehouse/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'name email')
            .populate('orderItems.farmer', 'name farmLocation')
            .populate('orderItems.product', 'name')
            .populate('assignedDeliveryBoy', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders pending warehouse inspection
// @route   GET /api/warehouse/orders/pending
// @access  Private/Warehouse/Admin
const getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            warehouseStatus: 'Pending Inspection' 
        })
        .populate('customer', 'name email')
        .populate('orderItems.farmer', 'name farmLocation')
        .populate('orderItems.product', 'name')
        .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept order after quality inspection
// @route   PUT /api/warehouse/orders/:id/accept
// @access  Private/Warehouse/Admin
const acceptOrder = async (req, res) => {
    try {
        const { qualityNotes } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.warehouseStatus = 'Quality Passed';
        order.status = 'Processing';
        order.qualityNotes = qualityNotes || 'Quality inspection passed';
        
        await order.save();
        
        res.json({ message: 'Order accepted', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject order if quality check fails
// @route   PUT /api/warehouse/orders/:id/reject
// @access  Private/Warehouse/Admin
const rejectOrder = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.warehouseStatus = 'Quality Failed';
        order.status = 'Cancelled';
        order.rejectionReason = rejectionReason || 'Quality check failed';
        
        await order.save();
        
        res.json({ message: 'Order rejected', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark order as ready to ship
// @route   PUT /api/warehouse/orders/:id/ship
// @access  Private/Warehouse/Admin
const markForShipping = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.warehouseStatus = 'Shipped';
        order.status = 'Shipped';
        
        await order.save();
        
        res.json({ message: 'Order marked as shipped', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirm delivery
// @route   PUT /api/warehouse/orders/:id/deliver
// @access  Private/Warehouse/Admin
const confirmDelivery = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'Delivered';
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        
        await order.save();
        
        res.json({ message: 'Delivery confirmed', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get warehouse statistics
// @route   GET /api/warehouse/stats
// @access  Private/Warehouse/Admin
const getWarehouseStats = async (req, res) => {
    try {
        const pendingInspection = await Order.countDocuments({ warehouseStatus: 'Pending Inspection' });
        const qualityPassed = await Order.countDocuments({ warehouseStatus: 'Quality Passed' });
        const qualityFailed = await Order.countDocuments({ warehouseStatus: 'Quality Failed' });
        const shipped = await Order.countDocuments({ warehouseStatus: 'Shipped' });
        const delivered = await Order.countDocuments({ isDelivered: true });

        res.json({
            pendingInspection,
            qualityPassed,
            qualityFailed,
            shipped,
            delivered
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllOrders,
    getPendingOrders,
    acceptOrder,
    rejectOrder,
    markForShipping,
    confirmDelivery,
    getWarehouseStats
};
