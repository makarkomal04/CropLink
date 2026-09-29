const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../config/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        // Blockchain fields
        blockchainTxHash,
        onBlockchain,
        paymentTxHash
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            customer: req.user._id,
            shippingAddress,
            paymentMethod,
            totalPrice,
            status: 'Pending',
            isPaid: true, // For demo purposes, assume paid
            paidAt: Date.now(),
            // Blockchain data
            blockchainTxHash,
            onBlockchain,
            paymentTxHash,
            blockchainStatus: onBlockchain ? 'Payment Sent' : undefined
        });

        // 1. First Validate All Items Stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }
            if (product.quantity < item.qty) {
                return res.status(400).json({ 
                    message: `Product "${product.name}" is out of stock or insufficient quantity (Available: ${product.quantity}kg)` 
                });
            }
        }

        // 2. If all valid, proceed with order creation and stock decrement
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                // Defensively set farmer if missing from request
                if (!item.farmer) {
                    item.farmer = product.farmer;
                }
                
                product.quantity = product.quantity - item.qty;
                await product.save();
            }
        }

        const createdOrder = await order.save();
        
        // Send order confirmation email to customer
        try {
            if (req.user.email) {
                await sendEmail({
                    to: req.user.email,
                    subject: 'Order Confirmation - CropLink',
                    html: emailTemplates.orderConfirmation(createdOrder, req.user.name)
                });
            }

            // Notify farmers whose products are in the order
            const farmerIds = [...new Set(orderItems.map(item => item.farmer))];
            for (const farmerId of farmerIds) {
                const farmer = await User.findById(farmerId);
                if (farmer && farmer.email) {
                    const farmerProducts = orderItems.filter(item => 
                        item.farmer.toString() === farmerId.toString()
                    );
                    
                    await sendEmail({
                        to: farmer.email,
                        subject: 'New Order Received - CropLink',
                        html: emailTemplates.newOrderToFarmer(createdOrder, farmer.name, farmerProducts)
                    });
                }
            }
        } catch (emailError) {
            console.error('Error sending order emails:', emailError);
            // Don't fail the order if email fails
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ customer: req.user._id })
        .populate({
            path: 'orderItems.product',
            populate: {
                path: 'farmer',
                select: 'name email farmLocation'
            }
        })
        .populate('customer', 'id name email')
        .populate('assignedDeliveryBoy', 'name email')
        .sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders (Admin/Warehouse)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({})
        .populate('customer', 'id name email')
        .populate('assignedDeliveryBoy', 'name email')
        .populate({
            path: 'orderItems.product',
            populate: {
                path: 'farmer',
                select: 'name email farmLocation'
            }
        })
        .sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Farmer/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        order.status = status;
        
        // Add status update timestamp
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status,
            updatedBy: req.user._id,
            updatedAt: Date.now()
        });

        await order.save();

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        // Count active farmers (verified)
        const activeFarmers = await User.countDocuments({ role: 'farmer', isVerified: true }); 
        // Or just role farmer:
        const totalFarmers = await User.countDocuments({ role: 'farmer' });

        // Calculate total revenue
        const orders = await Order.find({});
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            activeFarmers: totalFarmers // Using total for now as verification automated logic isn't strictly enforced yet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getStats
};
