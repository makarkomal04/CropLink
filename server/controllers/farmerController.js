const Order = require('../models/Order');

// @desc    Get farmer revenue stats
// @route   GET /api/farmers/revenue
// @access  Private/Farmer
const getFarmerRevenue = async (req, res) => {
    try {
        const farmerId = req.user._id;

        // Get all orders containing this farmer's products
        const orders = await Order.find({
            'orderItems.farmer': farmerId
        }).sort({ createdAt: -1 });

        // Calculate revenue statistics
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalProductsSold = 0;
        const revenueByMonth = {};
        const topProducts = {};

        orders.forEach(order => {
            const farmerItems = order.orderItems.filter(
                item => item.farmer.toString() === farmerId.toString()
            );

            if (farmerItems.length > 0) {
                totalOrders++;

                farmerItems.forEach(item => {
                    const itemRevenue = item.price * item.qty;
                    totalRevenue += itemRevenue;
                    totalProductsSold += item.qty;

                    // Track revenue by month
                    const month = new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                    });
                    revenueByMonth[month] = (revenueByMonth[month] || 0) + itemRevenue;

                    // Track top products
                    topProducts[item.name] = topProducts[item.name] || { 
                        name: item.name, 
                        quantity: 0, 
                        revenue: 0 
                    };
                    topProducts[item.name].quantity += item.qty;
                    topProducts[item.name].revenue += itemRevenue;
                });
            }
        });

        // Format monthly revenue for chart
        const monthlyRevenue = Object.entries(revenueByMonth).map(([month, revenue]) => ({
            month,
            revenue: parseFloat(revenue.toFixed(2))
        }));

        // Get top 5 products
        const topProductsArray = Object.values(topProducts)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(p => ({
                name: p.name,
                totalSold: p.quantity,
                revenue: parseFloat(p.revenue.toFixed(2))
            }));

        // Recent orders
        const recentOrders = orders.slice(0, 10).map(order => ({
            _id: order._id,
            date: order.createdAt,
            total: order.orderItems
                .filter(item => item.farmer.toString() === farmerId.toString())
                .reduce((sum, item) => sum + (item.price * item.qty), 0),
            status: order.status
        }));

        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        res.json({
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOrders,
            totalProductsSold,
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
            monthlyRevenue,
            topProducts: topProductsArray,
            recentOrders
        });
    } catch (error) {
        console.error('Error fetching farmer revenue:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFarmerRevenue
};
