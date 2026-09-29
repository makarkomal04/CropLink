import { useState, useEffect } from 'react';
import farmerService from '../../services/farmerService';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';

const FarmerRevenue = () => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRevenue();
    }, []);

    const fetchRevenue = async () => {
        try {
            const data = await farmerService.getFarmerRevenue();
            setRevenueData(data);
        } catch (error) {
            console.error('Error fetching revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading revenue data...</div>;
    }

    if (!revenueData) {
        return <div className="text-center py-12 text-gray-500">No revenue data available</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Revenue</p>
                            <h3 className="text-3xl font-bold mt-2">₹{revenueData.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <DollarSign size={40} className="opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Orders</p>
                            <h3 className="text-3xl font-bold mt-2">{revenueData.totalOrders}</h3>
                        </div>
                        <ShoppingCart size={40} className="opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Products Sold</p>
                            <h3 className="text-3xl font-bold mt-2">{revenueData.totalProductsSold} kg</h3>
                        </div>
                        <Package size={40} className="opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Avg Order Value</p>
                            <h3 className="text-3xl font-bold mt-2">
                                ₹{revenueData.totalOrders > 0
                                    ? (revenueData.totalRevenue / revenueData.totalOrders).toFixed(0)
                                    : 0}
                            </h3>
                        </div>
                        <TrendingUp size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Products</h3>
                <div className="space-y-4">
                    {revenueData.topProducts.length > 0 ? (
                        revenueData.topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-farmer-green rounded-full flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.quantity} kg sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-farmer-green">₹{product.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No products sold yet</p>
                    )}
                </div>
            </div>

            {/* Monthly Revenue Chart (Simple Bar Chart) */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Revenue by Month</h3>
                {revenueData.monthlyRevenue.length > 0 ? (
                    <div className="space-y-4">
                        {revenueData.monthlyRevenue.slice(-6).reverse().map((item, index) => {
                            const maxRevenue = Math.max(...revenueData.monthlyRevenue.map(m => m.revenue));
                            const barWidth = (item.revenue / maxRevenue) * 100;

                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{item.month}</span>
                                        <span className="font-bold text-farmer-green">₹{item.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-farmer-green to-green-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${barWidth}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No revenue data available yet</p>
                )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                    {revenueData.recentOrders.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Order ID</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.recentOrders.map(order => (
                                    <tr key={order._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                                            {order._id.substring(0, 8)}...
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-farmer-green">
                                            ₹{order.total.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No orders yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmerRevenue;
