import api from './api';

const getProducts = async (keyword = '') => {
    const response = await api.get(`/products?keyword=${keyword}`);
    return response.data;
};

const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

const createProduct = async (productData) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };
    const response = await api.post('/products', productData, config);
    return response.data;
};

const updateProduct = async (id, productData) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };
    const response = await api.put(`/products/${id}`, productData, config);
    return response.data;
};

const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

const productService = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};

export default productService;
