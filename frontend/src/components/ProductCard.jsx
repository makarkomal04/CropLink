import { useContext } from 'react';
import { ShoppingBasket, MapPin } from 'lucide-react';
import { apiBaseUrl } from '../services/api';
import CartContext from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-transparent hover:border-farmer-green/30 group">
            <div className="relative h-48 overflow-hidden bg-gray-100">
                {product.images && product.images[0] ? (
                    <img
                        src={`${apiBaseUrl}/${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBasket size={48} className="opacity-20" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${product.type === 'Organic' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                        {product.type}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                    <span className="text-xl font-bold text-farmer-green">₹{product.pricePerKg}<span className="text-sm font-normal text-gray-500">/kg</span></span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description || 'No description available'}</p>

                <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                    <MapPin size={14} className="mr-1 text-farmer-brown" />
                    <span className="font-medium mr-1">Farmer:</span> {product.farmer?.name || 'Unknown'}
                    {product.farmer?.farmLocation && <span className="ml-1">({product.farmer.farmLocation})</span>}
                </div>

                <button
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className={`w-full font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                        product.quantity <= 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-farmer-yellow text-farmer-brown hover:bg-yellow-300'
                    }`}
                >
                    <ShoppingBasket size={18} /> 
                    {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
