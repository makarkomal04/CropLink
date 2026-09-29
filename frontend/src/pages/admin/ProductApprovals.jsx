import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import { apiBaseUrl } from '../../services/api';

const ProductApprovals = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            const data = await adminService.getPendingProducts();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pending products:', error);
            toast.error('Failed to load pending products');
            setLoading(false);
        }
    };

    const handleApprove = async (productId) => {
        try {
            await adminService.approveProduct(productId);
            toast.success('Product approved successfully!');
            fetchPendingProducts();
        } catch (error) {
            toast.error('Error approving product');
        }
    };

    const handleReject = async (productId) => {
        if (window.confirm('Are you sure you want to reject this product? It will be deleted.')) {
            try {
                await adminService.rejectProduct(productId);
                toast.success('Product rejected successfully');
                fetchPendingProducts();
            } catch (error) {
                toast.error('Error rejecting product');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Approvals</h1>

            {loading ? (
                <div className="text-center py-10">Loading pending products...</div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No pending products to review</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
                            {/* Product Image */}
                            <div className="h-48 bg-gray-100 relative">
                                {product.images && product.images[0] ? (
                                    <img
                                        src={`${apiBaseUrl}/${product.images[0]}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={48} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        Pending
                                    </span>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description || 'No description'}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Category:</span>
                                        <span className="font-medium">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Type:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.type === 'Organic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {product.type}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Price:</span>
                                        <span className="font-bold text-farmer-green">₹{product.pricePerKg}/kg</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Stock:</span>
                                        <span className="font-medium">{product.quantity} kg</span>
                                    </div>
                                </div>

                                {/* Farmer Info */}
                                <div className="border-t pt-3 mb-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Farmer</p>
                                    <p className="font-medium text-gray-800">{product.farmer?.name}</p>
                                    {product.farmer?.farmLocation && (
                                        <p className="text-xs text-gray-500">📍 {product.farmer.farmLocation}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(product._id)}
                                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(product._id)}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductApprovals;
