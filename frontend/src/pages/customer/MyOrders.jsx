import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { Package, Calendar, MapPin, ShieldCheck } from 'lucide-react';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getMyOrders();
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="p-10 text-center">Loading orders...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-farmer-green mb-6">My Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sm:flex-row flex-col gap-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                                    <p className="font-bold text-farmer-green">₹{order.totalPrice}</p>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered:</h3>
                                <ul className="space-y-3">
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded md-flex items-center justify-center text-xs text-gray-400">
                                                    img
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-xs text-gray-500">Qty: {item.qty} kg</p>
                                                        <Link
                                                            to={`/verify/${(item.product && typeof item.product === 'object') ? item.product._id : item.product}`}
                                                            className="flex items-center gap-1 text-xs font-bold text-farmer-green hover:text-green-700 transition"
                                                        >
                                                            <ShieldCheck size={12} />
                                                            View Digital Receipt
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm">₹{item.price * item.qty}</p>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-start text-sm text-gray-600">
                                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                        <p>{order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
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

export default MyOrders;
