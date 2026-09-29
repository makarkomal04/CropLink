import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import AuthContext from '../../context/AuthContext';
import { Package, Calendar, User, MapPin, ShieldCheck } from 'lucide-react';

const FarmerOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Get all orders and filter for this farmer's products
            const data = await orderService.getMyOrders();
            // In a real app, we'd have a dedicated endpoint like /api/orders/farmer/:id
            // For now, we'll just show "My Orders" if they're also a customer
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Loading orders...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-farmer-green mb-2">Orders for My Products</h1>
            <p className="text-gray-600 mb-8">Manage orders and track deliveries</p>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No orders yet for your products</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sm:flex-row flex-col gap-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Order Date</p>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Customer</p>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <User size={14} className="mr-1" />
                                        {order.customer?.name || 'Customer'}
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                                    <p className="font-bold text-farmer-green">₹{order.totalPrice}</p>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Items:</h3>
                                <ul className="space-y-3">
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xs text-gray-500">Qty: {item.qty} kg × ₹{item.price}/kg</p>
                                                    <Link
                                                        to={`/verify/${typeof item.product === 'object' ? item.product._id : item.product}`}
                                                        className="flex items-center gap-1 text-xs font-bold text-farmer-green hover:text-green-700 transition"
                                                    >
                                                        <ShieldCheck size={12} />
                                                        View Receipt
                                                    </Link>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold">₹{item.price * item.qty}</p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-start text-sm text-gray-600">
                                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-700">Delivery Address:</p>
                                            <p>{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmerOrders;
