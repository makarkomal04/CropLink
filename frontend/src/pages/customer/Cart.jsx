import { useContext, useState } from 'react';
import CartContext from '../../context/CartContext';
import AuthContext from '../../context/AuthContext';
import { useBlockchain } from '../../context/BlockchainContext';
import orderService from '../../services/orderService';
import PaymentGateway from '../../components/PaymentGateway';
import toast from 'react-hot-toast';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../services/api';

const Cart = () => {
    const { cartItems, removeFromCart, updateQty, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { hasWallet } = useBlockchain();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.pricePerKg, 0);
    const shippingCost = 50;
    const totalAmount = subtotal + shippingCost;

    const handleProceedToPayment = () => {
        if (!user) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }
        setShowPayment(true);
    };

    const handlePaymentComplete = async (paymentMethod, txHash = null) => {
        setLoading(true);
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    qty: item.qty,
                    price: item.pricePerKg,
                    farmer: item.farmer._id || item.farmer,
                })),
                shippingAddress: {
                    address: '123 Main St',
                    city: 'Pune',
                    postalCode: '411001',
                    country: 'India'
                },
                paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' :
                    paymentMethod === 'card' ? 'Credit/Debit Card' :
                        paymentMethod === 'upi' ? 'UPI Payment' : 'Net Banking',
                totalPrice: totalAmount,
                // Blockchain fields (Authenticity only, no payment tx)
                onBlockchain: false,
                blockchainTxHash: null,
                paymentTxHash: txHash
            };

            await orderService.createOrder(orderData);
            toast.success(`Order placed successfully via ${orderData.paymentMethod}!`);
            clearCart();
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-500 mb-2">Your cart is empty</h2>
                <Link to="/shop" className="text-farmer-green font-semibold hover:underline">
                    Go to Marketplace
                </Link>
            </div>
        );
    }

    // Show payment gateway
    if (showPayment) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => setShowPayment(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-farmer-green mb-6 transition"
                >
                    <ArrowLeft size={20} />
                    Back to Cart
                </button>
                <PaymentGateway
                    totalAmount={totalAmount}
                    onPaymentComplete={handlePaymentComplete}
                    hasWallet={hasWallet}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-farmer-green mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="space-y-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.images && item.images[0] ? (
                                        <img src={`${apiBaseUrl}/${item.images[0]}`} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Price: ₹{item.pricePerKg}/kg</p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600">Qty (kg):</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.quantity}
                                            value={item.qty}
                                            onChange={(e) => updateQty(item._id, e.target.value)}
                                            className="w-16 p-2 border rounded-md text-center outline-none focus:border-farmer-green"
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400">Max: {item.quantity} kg</span>
                                </div>
                                <div className="font-bold text-farmer-green text-lg w-24 text-center">
                                    ₹{item.qty * item.pricePerKg}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-gray-400 hover:text-red-600 transition"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                        <div className="flex justify-between mb-2 text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Shipping</span>
                            <span>₹{shippingCost}</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between mb-6 text-xl font-bold text-gray-800">
                            <span>Total</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleProceedToPayment}
                            disabled={loading}
                            className="w-full bg-farmer-green text-white py-3 rounded-lg font-bold hover:bg-green-800 transition disabled:opacity-50"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
