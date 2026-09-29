import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { Sprout, LogOut, ShoppingCart, User, Wallet, Truck, Package } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <Sprout className="h-8 w-8 text-farmer-green" />
                                <span className="text-xl font-bold text-farmer-green">CROPLINK</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/shop" className="text-gray-600 hover:text-farmer-green font-medium transition">
                                Marketplace
                            </Link>

                            <Link to="/cart" className="relative text-gray-600 hover:text-farmer-green transition">
                                <ShoppingCart className="w-6 h-6" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <>
                                    {user.role === 'farmer' && (
                                        <>
                                            <Link to="/farmer" className="text-gray-600 hover:text-farmer-green font-medium transition">
                                                My Farm
                                            </Link>
                                            <Link to="/orders" className="text-gray-600 hover:text-farmer-green font-medium transition">
                                                My Orders
                                            </Link>
                                        </>
                                    )}
                                    {user.role === 'customer' && (
                                        <Link to="/orders" className="text-gray-600 hover:text-farmer-green font-medium transition">
                                            My Orders
                                        </Link>
                                    )}
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="text-gray-600 hover:text-farmer-green font-medium transition">
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user.role === 'warehouse' && (
                                        <Link to="/admin/warehouse" className="text-gray-600 hover:text-farmer-green font-medium transition flex items-center gap-1">
                                            <Package className="w-4 h-4" /> Warehouse
                                        </Link>
                                    )}
                                    {user.role === 'shipment_manager' && (
                                        <Link to="/shipment" className="text-gray-600 hover:text-farmer-green font-medium transition flex items-center gap-1">
                                            <Truck className="w-4 h-4" /> Shipment Panel
                                        </Link>
                                    )}
                                    {user.role === 'delivery_boy' && (
                                        <Link to="/delivery" className="text-gray-600 hover:text-farmer-green font-medium transition flex items-center gap-1">
                                            <Truck className="w-4 h-4" /> My Deliveries
                                        </Link>
                                    )}
                                    <Link to="/wallet" className="text-gray-600 hover:text-farmer-green font-medium transition flex items-center gap-1">
                                        <Wallet className="w-4 h-4" />
                                        Wallet
                                    </Link>
                                    <div className="flex items-center gap-4 border-l pl-4 ml-2">
                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <User className="w-4 h-4" /> {user.name}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-500 hover:text-red-600 transition"
                                            title="Logout"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex gap-4">
                                    <Link to="/login" className="text-gray-600 hover:text-farmer-green font-medium px-3 py-2">
                                        Login
                                    </Link>
                                    <Link to="/register" className="bg-farmer-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-farmer-brown text-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-farmer-yellow/80">© 2026 CropLink. Connecting Farmers directly to You.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
