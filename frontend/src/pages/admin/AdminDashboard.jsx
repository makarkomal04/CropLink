import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { Users, Sprout, ShoppingBag, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeFarmers: 0,
        totalProducts: 0,
        totalOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await orderService.getStats();
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats", error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Stat Info
    const statCards = [
        { title: 'Total Users', count: stats.totalUsers, icon: <Users className="text-blue-500" size={32} />, bg: 'bg-blue-100' },
        { title: 'Active Farmers', count: stats.activeFarmers, icon: <Sprout className="text-green-500" size={32} />, bg: 'bg-green-100' },
        { title: 'Total Products', count: stats.totalProducts, icon: <ShoppingBag className="text-purple-500" size={32} />, bg: 'bg-purple-100' },
        { title: 'Total Orders', count: stats.totalOrders, icon: <ShieldCheck className="text-orange-500" size={32} />, bg: 'bg-orange-100' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">System Overview & Management</p>

            {loading ? (
                <div className="text-center py-10">Loading stats...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className={`p-4 rounded-full ${stat.bg}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/admin/users"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-farmer-green hover:bg-green-50 transition group"
                            >
                                <h3 className="font-bold text-gray-800 group-hover:text-farmer-green mb-1">Manage Users</h3>
                                <p className="text-sm text-gray-500">Approve farmers, manage accounts</p>
                            </a>
                            <a
                                href="/admin/products"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-farmer-green hover:bg-green-50 transition group"
                            >
                                <h3 className="font-bold text-gray-800 group-hover:text-farmer-green mb-1">Product Approvals</h3>
                                <p className="text-sm text-gray-500">Review pending product listings</p>
                            </a>
                            <a
                                href="/admin/warehouse"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-farmer-green hover:bg-green-50 transition group"
                            >
                                <h3 className="font-bold text-gray-800 group-hover:text-farmer-green mb-1">Warehouse</h3>
                                <p className="text-sm text-gray-500">Manage stock & deliveries</p>
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">System Logs</h3>
                        <p>Platform running smoothly. No critical alerts.</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
