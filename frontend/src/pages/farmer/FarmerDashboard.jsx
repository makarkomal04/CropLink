import { useState, useEffect, useContext } from 'react';
import productService from '../../services/productService';
import AuthContext from '../../context/AuthContext';
import EditProduct from '../../components/EditProduct';
import { Plus, Trash2, Edit, Package, Sprout } from 'lucide-react';
import { apiBaseUrl } from '../../services/api';

const FarmerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetables',
        type: 'Organic',
        quantity: '',
        pricePerKg: '',
        description: '',
        harvestDate: '',
        expiryDate: '',
        batchNumber: '',
        farmerLocation: '',
        image: null
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts(); // Ideally filter by farmer ID in backend or here
            // Client side filtering for demo if backend returns all (Backend usually returns all for public, but for dashboard we might want only ours. 
            // In a real app, we'd have a /products/my endpoint. For now, filter by current user ID.)
            const myProducts = data.filter(p => p.farmer._id === user._id || p.farmer === user._id);
            setProducts(myProducts);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('type', formData.type);
        data.append('quantity', formData.quantity);
        data.append('pricePerKg', formData.pricePerKg);
        data.append('description', formData.description);
        data.append('harvestDate', formData.harvestDate);
        data.append('expiryDate', formData.expiryDate);
        data.append('batchNumber', formData.batchNumber);
        data.append('farmerLocation', formData.farmerLocation);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await productService.createProduct(data);
            setMessage('Product added successfully!');
            setShowAddForm(false);
            setFormData({
                name: '', category: 'Vegetables', type: 'Organic', quantity: '', pricePerKg: '', description: '',
                harvestDate: '', expiryDate: '', batchNumber: '', farmerLocation: '', image: null
            });
            fetchProducts();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error adding product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
    };

    const closeEdit = () => {
        setEditingProduct(null);
    };

    const handleEditSuccess = () => {
        fetchProducts();
        setMessage('Product updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-farmer-green">My Farm Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user.name} ({user.farmLocation})</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-farmer-green text-white px-5 py-2.5 rounded-lg hover:bg-green-800 transition shadow-md"
                >
                    {showAddForm ? 'Cancel' : <><Plus size={20} /> Add Product</>}
                </button>
            </div>

            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {message}
                </div>
            )}

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-farmer-accent mb-8 animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">List New Produce</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" placeholder="e.g. Red Onions" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none">
                                <option>Vegetables</option>
                                <option>Fruits</option>
                                <option>Grains</option>
                                <option>Others</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none">
                                <option>Organic</option>
                                <option>Pesticide-free</option>
                                <option>Conventional</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per kg (₹)</label>
                            <input type="number" name="pricePerKg" value={formData.pricePerKg} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" placeholder="e.g. 50" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                            <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" placeholder="e.g. B-123" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location (Override)</label>
                            <input type="text" name="farmerLocation" value={formData.farmerLocation} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" placeholder="City, State" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-farmer-yellow file:text-farmer-green hover:file:bg-farmer-yellow/80" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-farmer-green outline-none" rows="3"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-farmer-accent text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">List Product</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-farmer-green" /> My Inventory
                    </h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading inventory...</div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <Sprout size={48} className="mb-4 opacity-50" />
                        <p>No products listed yet. Start adding your harvest!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Price/kg</th>
                                    <th className="p-4">QR</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            {product.images && product.images[0] ? (
                                                <img src={`${apiBaseUrl}/${product.images[0]}`} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-xs">No Img</div>
                                            )}
                                            <span className="font-medium text-gray-800">{product.name}</span>
                                        </td>
                                        <td className="p-4 text-gray-600">{product.category}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.type === 'Organic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-800 font-medium">{product.quantity} kg</td>
                                        <td className="p-4 text-gray-800">₹{product.pricePerKg}</td>
                                        <td className="p-4">
                                            {product.qrCodePath ? (
                                                <div className="flex flex-col items-center gap-1 group relative">
                                                    <img
                                                        src={`${apiBaseUrl}${product.qrCodePath}`}
                                                        alt="QR"
                                                        className="w-10 h-10 border rounded cursor-zoom-in hover:scale-150 transition-transform bg-white"
                                                    />
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase">Scan to Verify</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">No QR</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-farmer-green hover:text-green-700 mr-3"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editingProduct && (
                <EditProduct 
                    product={editingProduct} 
                    onClose={closeEdit} 
                    onSuccess={handleEditSuccess} 
                />
            )}
        </div>
    );
};

export default FarmerDashboard;
