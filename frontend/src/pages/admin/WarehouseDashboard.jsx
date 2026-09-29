import { useState, useEffect } from 'react';
import warehouseService from '../../services/warehouseService';
import toast from 'react-hot-toast';
import { Package, CheckCircle, XCircle, Truck, Home, Clock, Ban } from 'lucide-react';

const WarehouseDashboard = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [qualityNotes, setQualityNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectingOrder, setRejectingOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersData, statsData] = await Promise.all([
                warehouseService.getAllOrders(),
                warehouseService.getWarehouseStats()
            ]);
            setAllOrders(ordersData);
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load warehouse data');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await warehouseService.acceptOrder(orderId, qualityNotes);
            toast.success('Order accepted - Quality check passed');
            setQualityNotes('');
            setSelectedOrder(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to accept order');
        }
    };

    const handleReject = async (orderId) => {
        if (!rejectionReason.trim()) {
            toast.error('Please enter a rejection reason');
            return;
        }
        try {
            await warehouseService.rejectOrder(orderId, rejectionReason);
            toast.success('Order rejected');
            setRejectionReason('');
            setRejectingOrder(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to reject order');
        }
    };

    const handleShip = async (orderId) => {
        try {
            await warehouseService.markForShipping(orderId);
            toast.success('Order marked as shipped');
            fetchData();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    const handleDeliver = async (orderId) => {
        if (!window.confirm('Confirm delivery of this order?')) return;
        try {
            await warehouseService.confirmDelivery(orderId);
            toast.success('Order marked as delivered');
            fetchData();
        } catch (error) {
            toast.error('Failed to confirm delivery');
        }
    };

    const getFilteredOrders = (status) => {
        if (status === 'pending') {
            return allOrders.filter(o => o.warehouseStatus === 'Pending Inspection');
        } else if (status === 'accepted') {
            return allOrders.filter(o => o.warehouseStatus === 'Quality Passed');
        } else if (status === 'rejected') {
            return allOrders.filter(o => o.warehouseStatus === 'Quality Failed' || o.status === 'Cancelled');
        } else if (status === 'shipped') {
            return allOrders.filter(o => o.warehouseStatus === 'Shipped' || o.status === 'Shipped');
        } else if (status === 'delivered') {
            return allOrders.filter(o => o.isDelivered === true);
        }
        return [];
    };

    const filteredOrders = getFilteredOrders(activeTab);

    if (loading) {
        return <div className="p-10 text-center">Loading warehouse data...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-farmer-green mb-8">Warehouse Management</h1>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-xs font-semibold">Pending</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.pendingInspection}</p>
                            </div>
                            <Clock size={32} className="text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-xs font-semibold">Accepted</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.qualityPassed}</p>
                            </div>
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-600 text-xs font-semibold">Rejected</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.qualityFailed}</p>
                            </div>
                            <Ban size={32} className="text-red-500" />
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-xs font-semibold">Shipped</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.shipped}</p>
                            </div>
                            <Truck size={32} className="text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-600 text-xs font-semibold">Delivered</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.delivered}</p>
                            </div>
                            <Home size={32} className="text-purple-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md mb-6">
                <div className="flex border-b overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-4 px-4 font-semibold transition text-sm ${activeTab === 'pending'
                                ? 'border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending ({getFilteredOrders('pending').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('accepted')}
                        className={`flex-1 py-4 px-4 font-semibold transition text-sm ${activeTab === 'accepted'
                                ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Accepted ({getFilteredOrders('accepted').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`flex-1 py-4 px-4 font-semibold transition text-sm ${activeTab === 'rejected'
                                ? 'border-b-2 border-red-500 text-red-600 bg-red-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Rejected ({getFilteredOrders('rejected').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shipped')}
                        className={`flex-1 py-4 px-4 font-semibold transition text-sm ${activeTab === 'shipped'
                                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Shipped ({getFilteredOrders('shipped').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('delivered')}
                        className={`flex-1 py-4 px-4 font-semibold transition text-sm ${activeTab === 'delivered'
                                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Delivered ({getFilteredOrders('delivered').length})
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-xl shadow-md p-6">
                {filteredOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders in this status</p>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-mono font-semibold">{order._id.substring(0, 12)}...</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Customer: {order.customer?.name || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="text-2xl font-bold text-farmer-green">₹{order.totalPrice}</p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${order.isDelivered ? 'bg-purple-100 text-purple-700' :
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                    order.warehouseStatus === 'Quality Failed' || order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.warehouseStatus === 'Quality Passed' ? 'bg-green-100 text-green-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.isDelivered ? 'Delivered' :
                                                order.warehouseStatus === 'Quality Failed' ? 'Rejected' :
                                                    order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                                    <ul className="space-y-1">
                                        {order.orderItems.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-600">
                                                • {item.name} - {item.qty} kg @ ₹{item.price}/kg
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Rejection Reason */}
                                {activeTab === 'rejected' && order.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                        <p className="text-red-700 font-semibold text-sm">Rejection Reason:</p>
                                        <p className="text-red-600 text-sm">{order.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Action Buttons based on status */}
                                {activeTab === 'pending' && (
                                    selectedOrder === order._id ? (
                                        /* Accept Panel */
                                        <div className="space-y-4 mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
                                            <p className="text-sm font-semibold text-green-700">✓ Accept Order</p>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quality Notes (optional)
                                                </label>
                                                <textarea
                                                    value={qualityNotes}
                                                    onChange={(e) => setQualityNotes(e.target.value)}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                                                    rows="2"
                                                    placeholder="Enter inspection notes..."
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleAccept(order._id)}
                                                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={18} />
                                                    Confirm Accept
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedOrder(null); setRejectingOrder(order._id); }}
                                                    className="flex-1 bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition"
                                                >
                                                    Switch to Reject
                                                </button>
                                                <button
                                                    onClick={() => setSelectedOrder(null)}
                                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : rejectingOrder === order._id ? (
                                        /* Reject Panel */
                                        <div className="space-y-4 mt-4 bg-red-50 border border-red-200 p-4 rounded-lg">
                                            <p className="text-sm font-semibold text-red-700">✗ Reject Order</p>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Rejection Reason <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400"
                                                    rows="2"
                                                    placeholder="Explain why this order is rejected..."
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleReject(order._id)}
                                                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                                                >
                                                    <XCircle size={18} />
                                                    Confirm Reject
                                                </button>
                                                <button
                                                    onClick={() => { setRejectingOrder(null); setSelectedOrder(order._id); }}
                                                    className="flex-1 bg-green-100 text-green-600 py-2 px-4 rounded-lg hover:bg-green-200 transition"
                                                >
                                                    Switch to Accept
                                                </button>
                                                <button
                                                    onClick={() => setRejectingOrder(null)}
                                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Initial Inspect Buttons */
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => { setSelectedOrder(order._id); setRejectingOrder(null); }}
                                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => { setRejectingOrder(order._id); setSelectedOrder(null); }}
                                                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    )
                                )}

                                {activeTab === 'accepted' && (
                                    <button
                                        onClick={() => handleShip(order._id)}
                                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                                    >
                                        <Truck size={20} />
                                        Mark as Shipped
                                    </button>
                                )}

                                {activeTab === 'rejected' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                        <p className="text-red-700 font-semibold">✗ Order Rejected</p>
                                        <p className="text-sm text-red-600 mt-1">Quality check failed</p>
                                    </div>
                                )}

                                {activeTab === 'shipped' && !order.isDelivered && (
                                    <button
                                        onClick={() => handleDeliver(order._id)}
                                        className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2"
                                    >
                                        <Home size={20} />
                                        Confirm Delivery
                                    </button>
                                )}

                                {activeTab === 'delivered' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                                        <p className="text-purple-700 font-semibold">✓ Delivered Successfully</p>
                                        {order.deliveredAt && (
                                            <p className="text-sm text-purple-600 mt-1">
                                                on {new Date(order.deliveredAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarehouseDashboard;
