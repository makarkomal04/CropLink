import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { MapPin, Calendar, Package, ShieldCheck, ShieldAlert, Loader } from 'lucide-react';
import axios from 'axios';
import { apiBaseUrl } from '../services/api';

const ProductVerification = () => {
    const { id } = useParams();
    const { verifyProduct } = useBlockchain(); // Assuming verifyProduct function exists in context
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [blockchainStatus, setBlockchainStatus] = useState('checking'); // checking, verified, not_found, error

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch from Database using dynamic base URL
                const { data } = await axios.get(`${apiBaseUrl}/api/products/${id}`);
                setProduct(data);

                // 2. Verify with Blockchain (if product has blockchainId or using ID as batchId)
                // Assuming we use the Mongo ID as the Batch ID on chain
                if (data) {
                    try {
                        // Re-create the hash to verify integrity (basic example)
                        // In a real app, you'd hash specific immutable fields
                        const isValid = await verifyProduct(data._id, data);
                        // Note: actual verification logic depends on what we stored. 
                        // If we just want to check existence:
                        // const exists = await checkProductOnChain(data._id);

                        // For this MVP, let's assume if it returns a record, it's verified.
                        setBlockchainStatus(isValid ? 'verified' : 'not_found');
                    } catch (bcError) {
                        console.error("Blockchain verification failed:", bcError);
                        setBlockchainStatus('error');
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setBlockchainStatus('error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, verifyProduct]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader className="animate-spin text-farmer-green h-12 w-12" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 text-xl font-bold">
            Product Not Found
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header / Banner */}
                <div className={`p-6 text-white ${blockchainStatus === 'verified' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-gray-700 to-gray-900'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Product Verification Receipt</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-lg opacity-90">
                                {blockchainStatus === 'verified' ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                                <span className="font-semibold uppercase tracking-wider">
                                    {blockchainStatus === 'verified' ? 'Authenticity Verified' : 'Unverified Source'}
                                </span>
                            </div>
                        </div>

                        {product?.qrCodePath && (
                            <div className="bg-white p-2 rounded-lg shadow-inner">
                                <img
                                    src={`${apiBaseUrl}${product.qrCodePath}`}
                                    alt="QR Code"
                                    className="w-24 h-24"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {/* Top Section: Image & Main Info */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-gray-100 pb-8">
                        <div className="md:w-1/3 flex-shrink-0">
                            {product.images?.[0] ? (
                                <img
                                    src={`${apiBaseUrl}/${product.images[0]}`}
                                    alt={product.name}
                                    className="w-full h-64 object-cover rounded-xl shadow-md border-2 border-gray-100"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    <Package size={48} />
                                </div>
                            )}
                        </div>

                        <div className="md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-farmer-yellow/20 text-farmer-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {product.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${product.type === 'Organic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {product.type}
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h2>
                            <p className="text-gray-500 text-lg mb-4">{product.description || "Fresh produce directly from the farm."}</p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Batch Number</p>
                                        <p>{product.batchNumber || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">Origin Farm</p>
                                    <p className="font-bold text-gray-800">{product.farmer?.name || "Unknown Farmer"}</p>
                                    <p className="text-sm text-gray-600 font-medium">{product.farmerLocation || product.farmer?.farmLocation || "Location not provided"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-amber-600">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">Key Dates</p>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between w-full gap-8">
                                            <span className="text-sm text-gray-600">Harvested:</span>
                                            <span className="text-sm font-bold text-gray-800">
                                                {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between w-full gap-8">
                                            <span className="text-sm text-gray-600">Expires:</span>
                                            <span className="text-sm font-bold text-red-600">
                                                {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Footer */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Blockchain Traceability</h3>
                                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                                    <p className="mb-2"><span className="text-slate-500">Contract:</span> 0xMarketplaceContractAddress...</p>
                                    <p className="mb-2"><span className="text-slate-500">Product ID:</span> {product._id}</p>
                                    <p className="mb-2"><span className="text-slate-500">Status:</span> {blockchainStatus.toUpperCase()}</p>
                                    <p><span className="text-slate-500">Timestamp:</span> {new Date().toISOString()}</p>
                                </div>
                            </div>

                            {product.qrCodePath && (
                                <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm self-center md:self-start">
                                    <img
                                        src={`${apiBaseUrl}${product.qrCodePath}`}
                                        alt="Product QR Code"
                                        className="w-32 h-32"
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Product QR Code</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8 text-gray-400 text-sm">
                <p>Verified by CropLink Blockchain Technology</p>
            </div>
        </div>
    );
};

export default ProductVerification;
