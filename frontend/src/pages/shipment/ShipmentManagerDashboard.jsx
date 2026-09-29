import { useState, useEffect } from 'react';
import shipmentService from '../../services/shipmentService';
import toast from 'react-hot-toast';
import { Truck, User, CheckCircle, Package, MapPin, Phone } from 'lucide-react';

const ShipmentManagerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignMap, setAssignMap] = useState({}); // orderId -> deliveryBoyId
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersData, boysData] = await Promise.all([
                shipmentService.getAcceptedOrders(),
                shipmentService.getDeliveryBoys()
            ]);
            setOrders(ordersData);
            setDeliveryBoys(boysData);
            // Pre-fill existing assignments
            const preAssign = {};
            ordersData.forEach(o => {
                if (o.assignedDeliveryBoy) {
                    preAssign[o._id] = o.assignedDeliveryBoy._id;
                }
            });
            setAssignMap(preAssign);
        } catch (error) {
            toast.error('Failed to load shipment data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (orderId) => {
        const deliveryBoyId = assignMap[orderId];
        if (!deliveryBoyId) {
            toast.error('Please select a delivery boy first');
            return;
        }
        try {
            setActionLoading(orderId + '_assign');
            await shipmentService.assignDeliveryBoy(orderId, deliveryBoyId);
            toast.success('Delivery boy assigned!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign delivery boy');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkShipped = async (orderId) => {
        try {
            setActionLoading(orderId + '_ship');
            await shipmentService.markShipped(orderId);
            toast.success('Order marked as Shipped!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark as shipped');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shipment data...</p>
                </div>
            </div>
        );
    }

    const pendingShipment = orders.filter(o => o.status !== 'Shipped');
    const shippedOrders = orders.filter(o => o.status === 'Shipped');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Truck className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Shipment Manager</h1>
                            <p className="text-blue-200 text-sm mt-1">Assign delivery boys and dispatch orders</p>
                        </div>
                    </div>
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                            <p className="text-3xl font-bold">{orders.length}</p>
                            <p className="text-blue-200 text-xs mt-1">Total Accepted</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                            <p className="text-3xl font-bold">{pendingShipment.length}</p>
                            <p className="text-blue-200 text-xs mt-1">Awaiting Shipment</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                            <p className="text-3xl font-bold">{deliveryBoys.length}</p>
                            <p className="text-blue-200 text-xs mt-1">Delivery Boys</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Delivery Boy List */}
                {deliveryBoys.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" /> Available Delivery Boys
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {deliveryBoys.map(boy => (
                                <span key={boy._id}
                                    className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    {boy.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Awaiting Shipment */}
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Orders Ready to Ship
                    <span className="ml-1 bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">{pendingShipment.length}</span>
                </h2>

                {pendingShipment.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-400">
                        <Truck className="w-14 h-14 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium">No orders awaiting shipment</p>
                        <p className="text-sm mt-1">Accepted orders from warehouse will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingShipment.map(order => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-mono">#{order._id.substring(0, 12)}...</p>
                                            <p className="font-semibold text-gray-800 mt-0.5">{order.customer?.name || 'Customer'}</p>
                                            <p className="text-sm text-gray-500">{order.customer?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-blue-600">₹{order.totalPrice}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">
                                            {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                                        </p>
                                    </div>

                                    {/* Items */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                                        <div className="space-y-1">
                                            {order.orderItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{item.name}</span>
                                                    <span className="text-gray-500">{item.qty} kg × ₹{item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Assign Delivery Boy */}
                                    <div className="border-t pt-4">
                                        {order.assignedDeliveryBoy ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400">Assigned to</p>
                                                        <p className="text-sm font-semibold text-gray-700">{order.assignedDeliveryBoy.name}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleMarkShipped(order._id)}
                                                    disabled={actionLoading === order._id + '_ship'}
                                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-60"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    {actionLoading === order._id + '_ship' ? 'Shipping...' : 'Mark Shipped'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <select
                                                    value={assignMap[order._id] || ''}
                                                    onChange={e => setAssignMap(prev => ({ ...prev, [order._id]: e.target.value }))}
                                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                                >
                                                    <option value="">Select Delivery Boy...</option>
                                                    {deliveryBoys.map(boy => (
                                                        <option key={boy._id} value={boy._id}>{boy.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAssign(order._id)}
                                                    disabled={!assignMap[order._id] || actionLoading === order._id + '_assign'}
                                                    className="bg-green-500 text-white px-5 py-2.5 rounded-xl hover:bg-green-600 transition flex items-center gap-2 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <User className="w-4 h-4" />
                                                    {actionLoading === order._id + '_assign' ? 'Assigning...' : 'Assign'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Already Shipped Orders */}
                {shippedOrders.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Dispatched Orders
                            <span className="ml-1 bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded-full">{shippedOrders.length}</span>
                        </h2>
                        <div className="space-y-3">
                            {shippedOrders.map(order => (
                                <div key={order._id} className="bg-white rounded-xl border border-green-100 shadow-sm p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{order.customer?.name}</p>
                                        <p className="text-sm text-gray-500">{order.orderItems.map(i => i.name).join(', ')}</p>
                                        {order.assignedDeliveryBoy && (
                                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                <Truck className="w-3 h-3" /> {order.assignedDeliveryBoy.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">Shipped ✓</span>
                                        <p className="text-lg font-bold text-gray-700 mt-1">₹{order.totalPrice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShipmentManagerDashboard;
