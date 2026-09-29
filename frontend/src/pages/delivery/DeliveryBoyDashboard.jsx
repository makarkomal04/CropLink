import { useState, useEffect } from 'react';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import { Package, CheckCircle, MapPin, User, Truck, Clock } from 'lucide-react';

const DeliveryBoyDashboard = () => {
    const [pendingDeliveries, setPendingDeliveries] = useState([]);
    const [completedDeliveries, setCompletedDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pending, completed] = await Promise.all([
                deliveryService.getMyDeliveries(),
                deliveryService.getMyCompletedDeliveries()
            ]);
            setPendingDeliveries(pending);
            setCompletedDeliveries(completed);
        } catch (error) {
            toast.error('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDelivered = async (orderId) => {
        if (!window.confirm('Confirm that this order has been delivered to the customer?')) return;
        try {
            setActionLoading(orderId);
            await deliveryService.markDelivered(orderId);
            toast.success('🎉 Order marked as Delivered!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark as delivered');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-8 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Truck className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
                            <p className="text-green-200 text-sm mt-1">Your assigned deliveries</p>
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                            <p className="text-3xl font-bold">{pendingDeliveries.length}</p>
                            <p className="text-green-200 text-xs mt-1 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" /> Pending Deliveries
                            </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                            <p className="text-3xl font-bold">{completedDeliveries.length}</p>
                            <p className="text-green-200 text-xs mt-1 flex items-center justify-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Completed
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex bg-white rounded-xl shadow-sm border mb-6 p-1">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                            activeTab === 'pending'
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pending ({pendingDeliveries.length})
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                            activeTab === 'completed'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Completed ({completedDeliveries.length})
                        </span>
                    </button>
                </div>

                {/* Pending Deliveries */}
                {activeTab === 'pending' && (
                    <>
                        {pendingDeliveries.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border p-14 text-center text-gray-400">
                                <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-semibold">No pending deliveries</p>
                                <p className="text-sm mt-1">New shipments will appear here when assigned to you</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingDeliveries.map(order => (
                                    <div key={order._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                                        {/* Status Bar */}
                                        <div className="h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                                        <div className="p-5">
                                            {/* Order Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-mono">Order #{order._id.substring(0, 10)}...</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <p className="font-semibold text-gray-800">{order.customer?.name}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500 ml-6">{order.customer?.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-green-600">₹{order.totalPrice}</p>
                                                    <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full mt-1">
                                                        Out for Delivery
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Delivery Address */}
                                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-green-700 mb-1">DELIVERY ADDRESS</p>
                                                    <p className="text-sm text-gray-700">{order.shippingAddress?.address}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{order.shippingAddress?.country}</p>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="mb-4">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order Items</p>
                                                <div className="space-y-1.5">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                                                            <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                                                            <span className="text-sm text-gray-500">{item.qty} kg</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Mark Delivered Button */}
                                            <button
                                                onClick={() => handleMarkDelivered(order._id)}
                                                disabled={actionLoading === order._id}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                {actionLoading === order._id ? 'Updating...' : 'Mark as Delivered'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Completed Deliveries */}
                {activeTab === 'completed' && (
                    <>
                        {completedDeliveries.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border p-14 text-center text-gray-400">
                                <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-semibold">No completed deliveries yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {completedDeliveries.map(order => (
                                    <div key={order._id} className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                                        <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                        <div className="p-4 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <p className="font-semibold text-gray-800">{order.customer?.name}</p>
                                                </div>
                                                <p className="text-sm text-gray-500 ml-6">
                                                    {order.orderItems.map(i => i.name).join(', ')}
                                                </p>
                                                {order.deliveredAt && (
                                                    <p className="text-xs text-gray-400 ml-6 mt-0.5">
                                                        Delivered: {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                                                    ✓ Delivered
                                                </span>
                                                <p className="text-lg font-bold text-gray-700 mt-1">₹{order.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DeliveryBoyDashboard;
