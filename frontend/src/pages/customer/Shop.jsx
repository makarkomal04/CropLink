import { useState, useEffect } from 'react';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [certificationFilter, setCertificationFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getProducts(searchTerm);
                // Only show approved products
                const approvedProducts = data.filter(p => p.isApproved !== false);
                setProducts(approvedProducts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products", error);
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Apply filters
    let filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    // Price filter
    filteredProducts = filteredProducts.filter(p =>
        p.pricePerKg >= priceRange[0] && p.pricePerKg <= priceRange[1]
    );

    // Certification filter
    if (certificationFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p =>
            certificationFilter === 'organic' ? p.type === 'Organic' : p.type !== 'Organic'
        );
    }

    // Sorting
    filteredProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-low') return a.pricePerKg - b.pricePerKg;
        if (sortBy === 'price-high') return b.pricePerKg - a.pricePerKg;
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-farmer-green mb-8">Marketplace</h1>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search fresh produce..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-farmer-green bg-white"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        {/* Category Filter */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Filter size={18} className="text-farmer-green" />
                                Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${selectedCategory === cat
                                                ? 'bg-farmer-green text-white font-medium'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="font-bold text-gray-800 mb-3">Price Range</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>₹{priceRange[0]}</span>
                                    <span>₹{priceRange[1]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full accent-farmer-green"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="font-bold text-gray-800 mb-3">Type</h3>
                            <div className="space-y-2">
                                {['all', 'organic', 'conventional'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setCertificationFilter(type)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${certificationFilter === type
                                                ? 'bg-farmer-green text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {type === 'all' ? 'All Products' : type === 'organic' ? '🌿 Organic Only' : 'Conventional'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="font-bold text-gray-800 mb-3">Sort By</h3>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-farmer-green text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white border rounded-lg w-full justify-center"
                        >
                            <SlidersHorizontal size={18} />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer-green mx-auto"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">No products found</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 text-sm text-gray-600">
                                    Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProducts.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
